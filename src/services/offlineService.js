import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import RNFS from 'react-native-fs';

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.lastSyncTimestamp = null;
    this.storageKeys = {
      syncQueue: '@kamer_sync_queue',
      lastSync: '@kamer_last_sync',
      userData: '@kamer_user_data',
      products: '@kamer_products',
      orders: '@kamer_orders',
      messages: '@kamer_messages',
      chats: '@kamer_chats',
      favorites: '@kamer_favorites',
      notifications: '@kamer_notifications',
      settings: '@kamer_settings'
    };
    
    this.setupNetworkListener();
    this.loadSyncQueue();
    this.loadLastSyncTimestamp();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      console.log('Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      });

      if (wasOffline && this.isOnline) {
        console.log('App is back online, processing sync queue');
        this.processSyncQueue();
      }
    });

    // Initial network state check
    NetInfo.fetch().then(state => {
      this.isOnline = state.isConnected && state.isInternetReachable;
    });
  }

  async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.storageKeys.syncQueue);
      this.syncQueue = queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem(this.storageKeys.syncQueue, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  async loadLastSyncTimestamp() {
    try {
      const timestamp = await AsyncStorage.getItem(this.storageKeys.lastSync);
      this.lastSyncTimestamp = timestamp;
    } catch (error) {
      console.error('Error loading last sync timestamp:', error);
    }
  }

  async saveLastSyncTimestamp(timestamp) {
    try {
      await AsyncStorage.setItem(this.storageKeys.lastSync, timestamp);
      this.lastSyncTimestamp = timestamp;
    } catch (error) {
      console.error('Error saving last sync timestamp:', error);
    }
  }

  // Data storage methods
  async storeData(key, data) {
    try {
      const dataWithTimestamp = {
        ...data,
        _lastModified: new Date().toISOString(),
        _cacheVersion: '1.0'
      };
      await AsyncStorage.setItem(key, JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
    }
  }

  async getData(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }

  // User data methods
  async cacheUser(user) {
    await this.storeData(this.storageKeys.userData, user);
  }

  async getCachedUser() {
    return await this.getData(this.storageKeys.userData);
  }

  // Product methods
  async cacheProducts(products) {
    const productsWithIndex = {
      products,
      index: this.createProductIndex(products),
      lastUpdated: new Date().toISOString()
    };
    await this.storeData(this.storageKeys.products, productsWithIndex);
  }

  async getCachedProducts(filters = {}) {
    const cachedData = await this.getData(this.storageKeys.products);
    if (!cachedData?.products) return [];

    let products = cachedData.products;

    // Apply filters
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters.sellerId) {
      products = products.filter(p => p.sellerId === filters.sellerId);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.minPrice !== undefined) {
      products = products.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter(p => p.price <= filters.maxPrice);
    }

    return products;
  }

  async getCachedProduct(productId) {
    const cachedData = await this.getData(this.storageKeys.products);
    if (!cachedData?.products) return null;

    return cachedData.products.find(p => p.id === productId) || null;
  }

  createProductIndex(products) {
    const index = {
      categories: {},
      sellers: {},
      priceRanges: {}
    };

    products.forEach(product => {
      // Category index
      if (!index.categories[product.category]) {
        index.categories[product.category] = [];
      }
      index.categories[product.category].push(product.id);

      // Seller index
      if (!index.sellers[product.sellerId]) {
        index.sellers[product.sellerId] = [];
      }
      index.sellers[product.sellerId].push(product.id);

      // Price range index
      const priceRange = Math.floor(product.price / 50000) * 50000;
      if (!index.priceRanges[priceRange]) {
        index.priceRanges[priceRange] = [];
      }
      index.priceRanges[priceRange].push(product.id);
    });

    return index;
  }

  // Order methods
  async cacheOrders(orders) {
    await this.storeData(this.storageKeys.orders, { orders, lastUpdated: new Date().toISOString() });
  }

  async getCachedOrders(userId) {
    const cachedData = await this.getData(this.storageKeys.orders);
    if (!cachedData?.orders) return [];

    return cachedData.orders.filter(order => 
      order.customerId === userId || order.sellerId === userId
    );
  }

  async getCachedOrder(orderId) {
    const cachedData = await this.getData(this.storageKeys.orders);
    if (!cachedData?.orders) return null;

    return cachedData.orders.find(o => o.id === orderId) || null;
  }

  // Chat and message methods
  async cacheChats(chats) {
    await this.storeData(this.storageKeys.chats, { chats, lastUpdated: new Date().toISOString() });
  }

  async getCachedChats(userId) {
    const cachedData = await this.getData(this.storageKeys.chats);
    if (!cachedData?.chats) return [];

    // Filter chats where user is participant
    return cachedData.chats.filter(chat => 
      chat.participants && chat.participants.some(p => p.userId === userId)
    );
  }

  async cacheMessages(messages) {
    const cachedData = await this.getData(this.storageKeys.messages) || { messages: {} };
    
    messages.forEach(message => {
      if (!cachedData.messages[message.chatId]) {
        cachedData.messages[message.chatId] = [];
      }
      
      // Update or add message
      const existingIndex = cachedData.messages[message.chatId].findIndex(m => m.id === message.id);
      if (existingIndex >= 0) {
        cachedData.messages[message.chatId][existingIndex] = message;
      } else {
        cachedData.messages[message.chatId].push(message);
      }
    });

    // Sort messages by sent time and limit to last 100 per chat
    Object.keys(cachedData.messages).forEach(chatId => {
      cachedData.messages[chatId] = cachedData.messages[chatId]
        .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
        .slice(-100);
    });

    cachedData.lastUpdated = new Date().toISOString();
    await this.storeData(this.storageKeys.messages, cachedData);
  }

  async getCachedMessages(chatId) {
    const cachedData = await this.getData(this.storageKeys.messages);
    if (!cachedData?.messages?.[chatId]) return [];

    return cachedData.messages[chatId].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  }

  // Favorites methods
  async cacheFavorites(favorites) {
    await this.storeData(this.storageKeys.favorites, { favorites, lastUpdated: new Date().toISOString() });
  }

  async getCachedFavorites(userId) {
    const cachedData = await this.getData(this.storageKeys.favorites);
    if (!cachedData?.favorites) return [];

    return cachedData.favorites.filter(favorite => favorite.userId === userId);
  }

  async toggleFavoriteOffline(userId, productId) {
    const favorites = await this.getCachedFavorites(userId);
    const existingFavorite = favorites.find(f => f.productId === productId);

    const action = {
      type: 'favorite_toggle',
      userId,
      productId,
      action: existingFavorite ? 'remove' : 'add',
      timestamp: new Date().toISOString(),
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`
    };

    // Update local cache
    let updatedFavorites;
    if (existingFavorite) {
      updatedFavorites = favorites.filter(f => f.productId !== productId);
    } else {
      updatedFavorites = [...favorites, {
        id: action.id,
        userId,
        productId,
        createdAt: new Date().toISOString()
      }];
    }

    await this.cacheFavorites(updatedFavorites);
    await this.addToSyncQueue(action);

    return !existingFavorite;
  }

  // Notification methods
  async cacheNotifications(notifications) {
    await this.storeData(this.storageKeys.notifications, { 
      notifications: notifications.slice(-50), // Keep only last 50
      lastUpdated: new Date().toISOString() 
    });
  }

  async getCachedNotifications(userId) {
    const cachedData = await this.getData(this.storageKeys.notifications);
    if (!cachedData?.notifications) return [];

    return cachedData.notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Message operations for offline mode
  async sendMessageOffline(chatId, message) {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const user = await this.getCachedUser();
    
    const messageData = {
      id: tempId,
      chatId,
      message,
      senderId: user?.id,
      type: 'text',
      sentAt: new Date().toISOString(),
      _isTemp: true,
      _status: 'pending'
    };

    // Store message locally
    await this.cacheMessages([messageData]);

    // Add to sync queue
    await this.addToSyncQueue({
      type: 'message_send',
      chatId,
      message,
      tempId,
      timestamp: new Date().toISOString()
    });

    return messageData;
  }

  // Product operations for offline mode
  async createProductOffline(productData) {
    const tempId = `temp_product_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const user = await this.getCachedUser();
    
    const product = {
      ...productData,
      id: tempId,
      sellerId: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _isTemp: true,
      _status: 'pending'
    };

    // Add to cached products
    const cachedProducts = await this.getCachedProducts();
    const updatedProducts = [product, ...cachedProducts];
    await this.cacheProducts(updatedProducts);

    // Add to sync queue
    await this.addToSyncQueue({
      type: 'product_create',
      data: product,
      tempId,
      timestamp: new Date().toISOString()
    });

    return product;
  }

  async updateProductOffline(productId, updates) {
    const cachedProducts = await this.getCachedProducts();
    const productIndex = cachedProducts.findIndex(p => p.id === productId);
    
    if (productIndex === -1) return null;

    const updatedProduct = {
      ...cachedProducts[productIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      _status: 'pending'
    };

    cachedProducts[productIndex] = updatedProduct;
    await this.cacheProducts(cachedProducts);

    await this.addToSyncQueue({
      type: 'product_update',
      productId,
      data: updates,
      timestamp: new Date().toISOString()
    });

    return updatedProduct;
  }

  // Sync queue management
  async addToSyncQueue(action) {
    this.syncQueue.push({
      ...action,
      id: action.id || `sync_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString()
    });

    await this.saveSyncQueue();
    
    // Try to process immediately if online
    if (this.isOnline) {
      setTimeout(() => this.processSyncQueue(), 1000);
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    console.log(`Processing sync queue with ${this.syncQueue.length} items`);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No auth token for sync');
        return;
      }

      const batchSize = 20;
      const batch = this.syncQueue.slice(0, batchSize);

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lastSyncTimestamp: this.lastSyncTimestamp,
          actions: batch
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local data with server response
        if (result.data) {
          await this.updateLocalDataFromSync(result.data);
        }

        // Handle conflicts
        if (result.conflicts && result.conflicts.length > 0) {
          console.warn('Sync conflicts detected:', result.conflicts);
          await this.handleSyncConflicts(result.conflicts);
        }

        // Remove processed items from queue
        this.syncQueue = this.syncQueue.slice(batchSize);
        await this.saveSyncQueue();

        // Update last sync timestamp
        await this.saveLastSyncTimestamp(result.timestamp);

        console.log(`Sync batch completed. ${this.syncQueue.length} items remaining.`);

        // Process remaining items if any
        if (this.syncQueue.length > 0) {
          setTimeout(() => this.processSyncQueue(), 2000);
        }

      } else {
        console.error('Sync failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }

  async updateLocalDataFromSync(syncData) {
    try {
      for (const [dataType, items] of Object.entries(syncData)) {
        switch (dataType) {
          case 'profile':
            if (items) await this.cacheUser(items);
            break;
          case 'products':
            if (items && items.length > 0) {
              const existingProducts = await this.getCachedProducts();
              const mergedProducts = this.mergeArrays(existingProducts, items, 'id');
              await this.cacheProducts(mergedProducts);
            }
            break;
          case 'orders':
            if (items && items.length > 0) {
              const existingOrders = await this.getCachedOrders();
              const mergedOrders = this.mergeArrays(existingOrders, items, 'id');
              await this.cacheOrders(mergedOrders);
            }
            break;
          case 'messages':
            if (items && items.length > 0) await this.cacheMessages(items);
            break;
          case 'chats':
            if (items && items.length > 0) await this.cacheChats(items);
            break;
          case 'favorites':
            if (items && items.length > 0) await this.cacheFavorites(items);
            break;
          case 'notifications':
            if (items && items.length > 0) await this.cacheNotifications(items);
            break;
        }
      }
    } catch (error) {
      console.error('Error updating local data from sync:', error);
    }
  }

  mergeArrays(existing, incoming, keyField) {
    const existingMap = new Map(existing.map(item => [item[keyField], item]));
    
    incoming.forEach(item => {
      if (item._isTemp) return; // Skip temporary items from server
      existingMap.set(item[keyField], item);
    });
    
    return Array.from(existingMap.values());
  }

  async handleSyncConflicts(conflicts) {
    for (const conflict of conflicts) {
      console.warn(`Handling sync conflict for ${conflict.type}:`, conflict);
      
      switch (conflict.resolution) {
        case 'server_wins':
          // Server data is already applied
          break;
        case 'client_wins':
          // Re-queue the client action
          await this.addToSyncQueue({
            type: `${conflict.type}_update`,
            data: conflict.clientData,
            timestamp: new Date().toISOString(),
            _retry: true
          });
          break;
        case 'manual':
          // Store conflict for user resolution
          await this.storeConflictForResolution(conflict);
          break;
      }
    }
  }

  async storeConflictForResolution(conflict) {
    const conflicts = await this.getData('@kamer_conflicts') || [];
    conflicts.push({
      ...conflict,
      id: `conflict_${Date.now()}`,
      createdAt: new Date().toISOString()
    });
    await this.storeData('@kamer_conflicts', conflicts);
  }

  // File caching for images
  async cacheImage(imageUrl, filename) {
    try {
      const cachePath = `${RNFS.CachesDirectoryPath}/images/${filename}`;
      const dirPath = `${RNFS.CachesDirectoryPath}/images`;
      
      // Create directory if it doesn't exist
      const dirExists = await RNFS.exists(dirPath);
      if (!dirExists) {
        await RNFS.mkdir(dirPath);
      }

      // Check if file already cached
      const fileExists = await RNFS.exists(cachePath);
      if (fileExists) {
        return `file://${cachePath}`;
      }

      // Download and cache
      const download = RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: cachePath,
        discretionary: true,
        cacheable: true
      });

      const result = await download.promise;
      
      if (result.statusCode === 200) {
        return `file://${cachePath}`;
      } else {
        throw new Error(`Download failed with status: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Error caching image:', error);
      return imageUrl; // Return original URL as fallback
    }
  }

  async getCachedImagePath(filename) {
    const cachePath = `${RNFS.CachesDirectoryPath}/images/${filename}`;
    const exists = await RNFS.exists(cachePath);
    return exists ? `file://${cachePath}` : null;
  }

  // Utility methods
  isOffline() {
    return !this.isOnline;
  }

  getSyncQueueLength() {
    return this.syncQueue.length;
  }

  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const kamerKeys = keys.filter(key => key.startsWith('@kamer_'));
      
      const info = {
        totalKeys: kamerKeys.length,
        syncQueueLength: this.syncQueue.length,
        lastSyncTimestamp: this.lastSyncTimestamp,
        isOnline: this.isOnline,
        storageBreakdown: {}
      };

      // Get size of each store
      for (const key of Object.values(this.storageKeys)) {
        try {
          const data = await AsyncStorage.getItem(key);
          info.storageBreakdown[key.replace('@kamer_', '')] = data ? JSON.stringify(data).length : 0;
        } catch (error) {
          info.storageBreakdown[key.replace('@kamer_', '')] = 'error';
        }
      }

      return info;
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  async clearAllData() {
    try {
      const keys = Object.values(this.storageKeys);
      await AsyncStorage.multiRemove(keys);
      this.syncQueue = [];
      this.lastSyncTimestamp = null;
      
      // Clear image cache
      const imageCachePath = `${RNFS.CachesDirectoryPath}/images`;
      const exists = await RNFS.exists(imageCachePath);
      if (exists) {
        await RNFS.unlink(imageCachePath);
      }
      
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Export data for debugging
  async exportData() {
    try {
      const data = {};
      for (const [name, key] of Object.entries(this.storageKeys)) {
        data[name] = await this.getData(key);
      }
      data.syncQueue = this.syncQueue;
      data.lastSyncTimestamp = this.lastSyncTimestamp;
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
}

export default new OfflineService();