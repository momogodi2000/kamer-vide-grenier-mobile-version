import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-netinfo/netinfo';
import offlineService from '../services/offlineService';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!offlineService.isOnline);
  const [syncQueueLength, setSyncQueueLength] = useState(offlineService.getSyncQueueLength());
  const [lastSyncTime, setLastSyncTime] = useState(offlineService.lastSyncTimestamp);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkInfo(state);
      setIsOffline(!state.isConnected || !state.isInternetReachable);
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      setNetworkInfo(state);
      setIsOffline(!state.isConnected || !state.isInternetReachable);
    });

    // Update sync queue length periodically
    const interval = setInterval(() => {
      setSyncQueueLength(offlineService.getSyncQueueLength());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getCachedData = useCallback(async (key) => {
    return await offlineService.getData(key);
  }, []);

  const storeData = useCallback(async (key, data) => {
    return await offlineService.storeData(key, data);
  }, []);

  const getCachedProducts = useCallback(async (filters = {}) => {
    return await offlineService.getCachedProducts(filters);
  }, []);

  const getCachedProduct = useCallback(async (productId) => {
    return await offlineService.getCachedProduct(productId);
  }, []);

  const getCachedOrders = useCallback(async (userId) => {
    return await offlineService.getCachedOrders(userId);
  }, []);

  const getCachedOrder = useCallback(async (orderId) => {
    return await offlineService.getCachedOrder(orderId);
  }, []);

  const getCachedChats = useCallback(async (userId) => {
    return await offlineService.getCachedChats(userId);
  }, []);

  const getCachedMessages = useCallback(async (chatId) => {
    return await offlineService.getCachedMessages(chatId);
  }, []);

  const getCachedFavorites = useCallback(async (userId) => {
    return await offlineService.getCachedFavorites(userId);
  }, []);

  const getCachedNotifications = useCallback(async (userId) => {
    return await offlineService.getCachedNotifications(userId);
  }, []);

  const toggleFavoriteOffline = useCallback(async (userId, productId) => {
    return await offlineService.toggleFavoriteOffline(userId, productId);
  }, []);

  const createProductOffline = useCallback(async (productData) => {
    return await offlineService.createProductOffline(productData);
  }, []);

  const updateProductOffline = useCallback(async (productId, updates) => {
    return await offlineService.updateProductOffline(productId, updates);
  }, []);

  const sendMessageOffline = useCallback(async (chatId, message) => {
    return await offlineService.sendMessageOffline(chatId, message);
  }, []);

  const cacheImage = useCallback(async (imageUrl, filename) => {
    return await offlineService.cacheImage(imageUrl, filename);
  }, []);

  const getCachedImagePath = useCallback(async (filename) => {
    return await offlineService.getCachedImagePath(filename);
  }, []);

  const forceSync = useCallback(async () => {
    if (isOffline) {
      throw new Error('Cannot sync while offline');
    }
    
    setIsSyncing(true);
    try {
      await offlineService.processSyncQueue();
      setLastSyncTime(offlineService.lastSyncTimestamp);
      setSyncQueueLength(offlineService.getSyncQueueLength());
    } finally {
      setIsSyncing(false);
    }
  }, [isOffline]);

  const clearOfflineData = useCallback(async () => {
    await offlineService.clearAllData();
    setSyncQueueLength(0);
    setLastSyncTime(null);
  }, []);

  const getStorageInfo = useCallback(async () => {
    return await offlineService.getStorageInfo();
  }, []);

  const exportData = useCallback(async () => {
    return await offlineService.exportData();
  }, []);

  // Cache essential data for offline use
  const cacheEssentialData = useCallback(async (userId) => {
    try {
      // Cache user data
      const user = await offlineService.getCachedUser();
      if (!user) {
        // Fetch from API if not cached
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          await offlineService.cacheUser(userData.data);
        }
      }

      // Cache recent products
      const cachedProducts = await offlineService.getCachedProducts();
      if (cachedProducts.length === 0) {
        const response = await fetch('/api/products?limit=50');
        if (response.ok) {
          const productsData = await response.json();
          await offlineService.cacheProducts(productsData.data.products);
        }
      }

      // Cache user's orders
      const cachedOrders = await offlineService.getCachedOrders(userId);
      if (cachedOrders.length === 0) {
        const response = await fetch('/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const ordersData = await response.json();
          await offlineService.cacheOrders(ordersData.data.orders);
        }
      }

      // Cache favorites
      const cachedFavorites = await offlineService.getCachedFavorites(userId);
      if (cachedFavorites.length === 0) {
        const response = await fetch('/api/products/favorites', {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const favoritesData = await response.json();
          await offlineService.cacheFavorites(favoritesData.data);
        }
      }

      return true;
    } catch (error) {
      console.error('Error caching essential data:', error);
      return false;
    }
  }, []);

  // Smart data loading - try online first, fallback to cache
  const smartLoad = useCallback(async (endpoint, cacheKey, cacheMethod) => {
    try {
      if (!isOffline) {
        // Try online first
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Cache the data
          if (cacheMethod) {
            await cacheMethod(data.data);
          }
          return { data: data.data, source: 'online' };
        }
      }
      
      // Fallback to cache
      const cachedData = await getCachedData(cacheKey);
      return { data: cachedData, source: 'cache' };
      
    } catch (error) {
      // Fallback to cache on error
      const cachedData = await getCachedData(cacheKey);
      return { data: cachedData, source: 'cache' };
    }
  }, [isOffline, getCachedData]);

  return {
    // Network status
    isOffline,
    networkInfo,
    isSyncing,
    syncQueueLength,
    lastSyncTime,
    
    // Data access methods
    getCachedData,
    storeData,
    getCachedProducts,
    getCachedProduct,
    getCachedOrders,
    getCachedOrder,
    getCachedChats,
    getCachedMessages,
    getCachedFavorites,
    getCachedNotifications,
    
    // Offline operations
    toggleFavoriteOffline,
    createProductOffline,
    updateProductOffline,
    sendMessageOffline,
    
    // Image caching
    cacheImage,
    getCachedImagePath,
    
    // Sync management
    forceSync,
    clearOfflineData,
    getStorageInfo,
    exportData,
    
    // Smart loading
    cacheEssentialData,
    smartLoad
  };
};