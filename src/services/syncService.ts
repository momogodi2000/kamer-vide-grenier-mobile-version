import NetInfo from '@react-native-community/netinfo';
import { offlineDatabase, OfflineAction } from './offlineDatabase';
import { productService } from './productService';
import { orderService } from './orderService';
import { cartService } from './cartService';
import { authService } from './authService';
import { apiClient } from './api';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingActions: number;
  syncProgress: number; // 0-100
  syncErrors: string[];
}

export interface SyncResult {
  success: boolean;
  syncedActions: number;
  failedActions: number;
  errors: string[];
}

export class SyncService {
  private static instance: SyncService;
  private syncStatus: SyncStatus = {
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingActions: 0,
    syncProgress: 0,
    syncErrors: [],
  };
  
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private backgroundSyncInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize sync service with network monitoring
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize offline database
      await offlineDatabase.initialize();

      // Monitor network connectivity
      NetInfo.addEventListener((state) => {
        const wasOnline = this.syncStatus.isOnline;
        this.syncStatus.isOnline = !!(state.isConnected && state.isInternetReachable);

        if (!wasOnline && this.syncStatus.isOnline) {
          // Just came back online, trigger sync
          console.log('📶 Network restored, triggering sync...');
          this.performBackgroundSync();
        }

        this.notifySyncListeners();
      });

      // Get initial network status
      const networkState = await NetInfo.fetch();
      this.syncStatus.isOnline = !!(networkState.isConnected && networkState.isInternetReachable);

      // Update pending actions count
      await this.updatePendingActionsCount();

      // Load last sync time
      const lastSyncTime = await offlineDatabase.getSecureData?.('last_sync_time');
      if (lastSyncTime) {
        this.syncStatus.lastSyncTime = parseInt(lastSyncTime, 10);
      }

      // Start background sync timer (every 5 minutes when online)
      this.startBackgroundSync();

      this.isInitialized = true;
      console.log('✅ Sync service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize sync service:', error);
      throw error;
    }
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener);
    // Immediately notify with current status
    listener(this.syncStatus);
  }

  /**
   * Remove sync status listener
   */
  removeSyncListener(listener: (status: SyncStatus) => void): void {
    const index = this.syncListeners.indexOf(listener);
    if (index > -1) {
      this.syncListeners.splice(index, 1);
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Manually trigger synchronization
   */
  async syncNow(): Promise<SyncResult> {
    if (this.syncStatus.isSyncing) {
      return {
        success: false,
        syncedActions: 0,
        failedActions: 0,
        errors: ['Synchronization already in progress'],
      };
    }

    if (!this.syncStatus.isOnline) {
      return {
        success: false,
        syncedActions: 0,
        failedActions: 0,
        errors: ['No internet connection available'],
      };
    }

    return this.performSync();
  }

  /**
   * Queue an offline action for later synchronization
   */
  async queueOfflineAction(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'product' | 'order' | 'cart' | 'user' | 'wishlist' | 'review',
    entityId: string,
    data: any
  ): Promise<void> {
    await offlineDatabase.addOfflineAction({
      type,
      entity,
      entityId,
      data,
    });

    await this.updatePendingActionsCount();
    this.notifySyncListeners();

    // Try immediate sync if online
    if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
      this.performBackgroundSync();
    }
  }

  /**
   * Perform synchronization
   */
  private async performSync(): Promise<SyncResult> {
    console.log('🔄 Starting synchronization...');
    
    this.syncStatus.isSyncing = true;
    this.syncStatus.syncProgress = 0;
    this.syncStatus.syncErrors = [];
    this.notifySyncListeners();

    const result: SyncResult = {
      success: true,
      syncedActions: 0,
      failedActions: 0,
      errors: [],
    };

    try {
      // Get all pending actions
      const pendingActions = await offlineDatabase.getPendingOfflineActions();
      
      if (pendingActions.length === 0) {
        console.log('✅ No pending actions to sync');
        this.syncStatus.lastSyncTime = Date.now();
        return result;
      }

      console.log(`📋 Found ${pendingActions.length} pending actions to sync`);

      // Process actions in batches
      const batchSize = 5;
      for (let i = 0; i < pendingActions.length; i += batchSize) {
        const batch = pendingActions.slice(i, i + batchSize);
        
        // Process batch
        const batchResults = await Promise.allSettled(
          batch.map(action => this.processOfflineAction(action))
        );

        // Update results and progress
        batchResults.forEach((batchResult, index) => {
          const action = batch[index];
          
          if (batchResult.status === 'fulfilled' && batchResult.value.success) {
            result.syncedActions++;
            offlineDatabase.markActionAsSynced(action.id);
          } else {
            result.failedActions++;
            const error = batchResult.status === 'rejected'
              ? batchResult.reason?.message || 'Unknown error'
              : batchResult.value?.error || 'Sync failed';
            
            result.errors.push(`${action.entity}:${action.entityId} - ${error}`);
            
            // Increment retry count
            offlineDatabase.incrementActionRetryCount(action.id);
            
            // Remove actions that have failed too many times (max 5 retries)
            if (action.retry_count >= 5) {
              console.warn(`❌ Removing action ${action.id} after 5 failed attempts`);
              offlineDatabase.removeOfflineAction(action.id);
            }
          }
        });

        // Update progress
        this.syncStatus.syncProgress = Math.round(((i + batch.length) / pendingActions.length) * 100);
        this.notifySyncListeners();
      }

      // Sync analytics events
      await this.syncAnalyticsEvents();

      // Update cache with fresh data
      await this.refreshCachedData();

      this.syncStatus.lastSyncTime = Date.now();
      await offlineDatabase.storeSecureData?.('last_sync_time', this.syncStatus.lastSyncTime.toString());

      console.log(`✅ Sync completed: ${result.syncedActions} synced, ${result.failedActions} failed`);

    } catch (error: any) {
      console.error('❌ Sync failed:', error);
      result.success = false;
      result.errors.push(error.message || 'Unknown sync error');
    } finally {
      this.syncStatus.isSyncing = false;
      this.syncStatus.syncProgress = 100;
      this.syncStatus.syncErrors = result.errors;
      
      await this.updatePendingActionsCount();
      this.notifySyncListeners();
    }

    return result;
  }

  /**
   * Process a single offline action
   */
  private async processOfflineAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Processing ${action.type} ${action.entity}:${action.entityId}`);

      switch (action.entity) {
        case 'product':
          return await this.syncProductAction(action);
        case 'order':
          return await this.syncOrderAction(action);
        case 'cart':
          return await this.syncCartAction(action);
        case 'user':
          return await this.syncUserAction(action);
        case 'wishlist':
          return await this.syncWishlistAction(action);
        case 'review':
          return await this.syncReviewAction(action);
        default:
          return { success: false, error: `Unknown entity type: ${action.entity}` };
      }
    } catch (error: any) {
      console.error(`❌ Failed to process action ${action.id}:`, error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Sync product-related actions
   */
  private async syncProductAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'CREATE':
        const createResponse = await productService.createProduct(action.data);
        return { success: createResponse.success, error: createResponse.message };
      
      case 'UPDATE':
        const updateResponse = await productService.updateProduct(action.entityId, action.data);
        return { success: updateResponse.success, error: updateResponse.message };
      
      case 'DELETE':
        const deleteResponse = await productService.deleteProduct(action.entityId);
        return { success: deleteResponse.success, error: deleteResponse.message };
      
      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  }

  /**
   * Sync order-related actions
   */
  private async syncOrderAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'CREATE':
        const createResponse = await orderService.createOrder(action.data);
        return { success: createResponse.success, error: createResponse.message };
      
      case 'UPDATE':
        const updateResponse = await orderService.updateOrderStatus(action.entityId, action.data);
        return { success: updateResponse.success, error: updateResponse.message };
      
      default:
        return { success: false, error: `Unsupported order action: ${action.type}` };
    }
  }

  /**
   * Sync cart-related actions
   */
  private async syncCartAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'CREATE':
        const addResponse = await cartService.addToCart(action.data.product_id, action.data.quantity);
        return { success: addResponse.success, error: addResponse.message };
      
      case 'UPDATE':
        const updateResponse = await cartService.updateCartItem(action.entityId, action.data.quantity);
        return { success: updateResponse.success, error: updateResponse.message };
      
      case 'DELETE':
        const removeResponse = await cartService.removeFromCart(action.entityId);
        return { success: removeResponse.success, error: removeResponse.message };
      
      default:
        return { success: false, error: `Unknown cart action: ${action.type}` };
    }
  }

  /**
   * Sync user-related actions
   */
  private async syncUserAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'UPDATE':
        const updateResponse = await authService.updateProfile(action.data);
        return { success: updateResponse.success, error: updateResponse.message };
      
      default:
        return { success: false, error: `Unsupported user action: ${action.type}` };
    }
  }

  /**
   * Sync wishlist actions
   */
  private async syncWishlistAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'CREATE':
        const addResponse = await productService.addToWishlist(action.entityId);
        return { success: addResponse.success, error: addResponse.message };
      
      case 'DELETE':
        const removeResponse = await productService.removeFromWishlist(action.entityId);
        return { success: removeResponse.success, error: removeResponse.message };
      
      default:
        return { success: false, error: `Unknown wishlist action: ${action.type}` };
    }
  }

  /**
   * Sync review actions
   */
  private async syncReviewAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'CREATE':
        // Implement review creation API call
        const response = await apiClient.post('/reviews', action.data);
        return { success: response.success, error: response.message };
      
      default:
        return { success: false, error: `Unsupported review action: ${action.type}` };
    }
  }

  /**
   * Sync analytics events
   */
  private async syncAnalyticsEvents(): Promise<void> {
    try {
      const pendingEvents = await offlineDatabase.getPendingAnalyticsEvents();
      
      if (pendingEvents.length === 0) return;

      console.log(`📊 Syncing ${pendingEvents.length} analytics events...`);

      // Send analytics events to backend
      const response = await apiClient.post('/analytics/events', {
        events: pendingEvents,
      });

      if (response.success) {
        // Mark events as synced
        const eventIds = pendingEvents.map(event => event.id);
        await offlineDatabase.markAnalyticsEventsSynced(eventIds);
        console.log('✅ Analytics events synced successfully');
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync analytics events:', error);
    }
  }

  /**
   * Refresh cached data from server
   */
  private async refreshCachedData(): Promise<void> {
    try {
      // Refresh featured products
      const featuredProducts = await productService.getFeaturedProducts();
      if (featuredProducts.success && featuredProducts.data) {
        await offlineDatabase.cacheProducts(featuredProducts.data, 24);
      }

      // Refresh recent products
      const recentProducts = await productService.getRecentProducts(50);
      if (recentProducts.success && recentProducts.data) {
        await offlineDatabase.cacheProducts(recentProducts.data, 12);
      }

      // Refresh user cart
      const cart = await cartService.getCart();
      if (cart.success && cart.data && cart.data.items) {
        // Clear offline cart and update with server data
        await offlineDatabase.clearOfflineCart();
        for (const item of cart.data.items) {
          await offlineDatabase.addToOfflineCart(item);
        }
      }

      console.log('✅ Cached data refreshed');
    } catch (error) {
      console.warn('⚠️ Failed to refresh cached data:', error);
    }
  }

  /**
   * Start background synchronization
   */
  private startBackgroundSync(): void {
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
    }

    this.backgroundSyncInterval = setInterval(() => {
      this.performBackgroundSync();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Perform background sync (silent)
   */
  private async performBackgroundSync(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return;
    }

    try {
      // Only sync if there are pending actions
      const pendingCount = await this.updatePendingActionsCount();
      if (pendingCount > 0) {
        console.log('🔄 Background sync triggered');
        await this.performSync();
      }
    } catch (error) {
      console.warn('⚠️ Background sync failed:', error);
    }
  }

  /**
   * Update pending actions count
   */
  private async updatePendingActionsCount(): Promise<number> {
    try {
      const pendingActions = await offlineDatabase.getPendingOfflineActions();
      this.syncStatus.pendingActions = pendingActions.length;
      return pendingActions.length;
    } catch (error) {
      console.error('Failed to update pending actions count:', error);
      return 0;
    }
  }

  /**
   * Notify all sync listeners
   */
  private notifySyncListeners(): void {
    this.syncListeners.forEach(listener => {
      try {
        listener({ ...this.syncStatus });
      } catch (error) {
        console.error('Error notifying sync listener:', error);
      }
    });
  }

  /**
   * Force refresh data from server
   */
  async forceRefreshData(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      throw new Error('No internet connection available');
    }

    console.log('🔄 Force refreshing data from server...');
    
    this.syncStatus.isSyncing = true;
    this.syncStatus.syncProgress = 0;
    this.notifySyncListeners();

    try {
      await this.refreshCachedData();
      
      // Clear expired data
      await offlineDatabase.clearExpiredData();
      
      this.syncStatus.lastSyncTime = Date.now();
      await offlineDatabase.storeSecureData?.('last_sync_time', this.syncStatus.lastSyncTime.toString());
      
      console.log('✅ Data refresh completed');
    } finally {
      this.syncStatus.isSyncing = false;
      this.syncStatus.syncProgress = 100;
      this.notifySyncListeners();
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<{
    pendingActions: number;
    lastSyncTime: number | null;
    cachedItemsCount: number;
    failedSyncsCount: number;
  }> {
    const dbStats = await offlineDatabase.getDatabaseStats();
    const failedActions = await offlineDatabase.getPendingOfflineActions();
    const failedCount = failedActions.filter(action => action.retry_count > 0).length;

    return {
      pendingActions: dbStats.pendingActions,
      lastSyncTime: this.syncStatus.lastSyncTime,
      cachedItemsCount: dbStats.cachedProducts + dbStats.cartItems,
      failedSyncsCount: failedCount,
    };
  }

  /**
   * Reset sync service (clear all offline data)
   */
  async resetSyncService(): Promise<void> {
    console.log('🔄 Resetting sync service...');
    
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
    }

    // Clear all offline data
    await offlineDatabase.clearExpiredData();
    await offlineDatabase.removeOfflineAction(''); // This might need to be modified
    
    // Reset sync status
    this.syncStatus = {
      isOnline: this.syncStatus.isOnline,
      isSyncing: false,
      lastSyncTime: null,
      pendingActions: 0,
      syncProgress: 0,
      syncErrors: [],
    };

    // Restart background sync
    this.startBackgroundSync();
    
    this.notifySyncListeners();
    console.log('✅ Sync service reset completed');
  }

  /**
   * Stop sync service
   */
  stop(): void {
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
      this.backgroundSyncInterval = null;
    }

    this.syncListeners = [];
    this.isInitialized = false;
  }
}

export const syncService = SyncService.getInstance();