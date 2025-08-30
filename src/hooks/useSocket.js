import { useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './useAuth';
import socketService from '../services/socketService';
import offlineService from '../services/offlineService';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const isInitialized = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (isAuthenticated && user && !isInitialized.current) {
      socketService.connect();
      isInitialized.current = true;
    }

    if (!isAuthenticated && isInitialized.current) {
      socketService.disconnect();
      isInitialized.current = false;
    }

    return () => {
      if (isInitialized.current) {
        socketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, [isAuthenticated, user]);

  // Handle app state changes for background/foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        socketService.enterForeground();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App went to background
        socketService.enterBackground();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const sendMessage = useCallback((chatId, message, type = 'text') => {
    if (socketService.isConnected) {
      return socketService.sendMessage(chatId, message, type);
    } else {
      // Send offline
      offlineService.sendMessageOffline(chatId, message);
      return false; // Indicate offline mode
    }
  }, []);

  const joinChat = useCallback((chatId, orderId) => {
    socketService.joinChat(chatId, orderId);
  }, []);

  const leaveChat = useCallback((chatId) => {
    socketService.leaveChat(chatId);
  }, []);

  const markMessageAsRead = useCallback((messageId, chatId) => {
    socketService.markMessageAsRead(messageId, chatId);
  }, []);

  const startTyping = useCallback((chatId) => {
    socketService.startTyping(chatId);
  }, []);

  const stopTyping = useCallback((chatId) => {
    socketService.stopTyping(chatId);
  }, []);

  const joinOrderUpdates = useCallback((orderId) => {
    socketService.joinOrderUpdates(orderId);
  }, []);

  const leaveOrderUpdates = useCallback((orderId) => {
    socketService.leaveOrderUpdates(orderId);
  }, []);

  const joinDeliveryTracking = useCallback((deliveryId) => {
    socketService.joinDeliveryTracking(deliveryId);
  }, []);

  const leaveDeliveryTracking = useCallback((deliveryId) => {
    socketService.leaveDeliveryTracking(deliveryId);
  }, []);

  const updateDeliveryLocation = useCallback((deliveryId, location) => {
    socketService.updateDeliveryLocation(deliveryId, location);
  }, []);

  const updateUserStatus = useCallback((status) => {
    socketService.updateUserStatus(status);
  }, []);

  const addEventListener = useCallback((event, callback) => {
    socketService.on(event, callback);
  }, []);

  const removeEventListener = useCallback((event, callback) => {
    socketService.off(event, callback);
  }, []);

  const reconnect = useCallback(() => {
    socketService.reconnect();
  }, []);

  const getConnectionStatus = useCallback(() => {
    return socketService.getConnectionStatus();
  }, []);

  const getStats = useCallback(() => {
    return socketService.getStats();
  }, []);

  return {
    // Connection status
    isConnected: socketService.isConnected,
    connectionState: socketService.connectionState,
    
    // Chat methods
    sendMessage,
    joinChat,
    leaveChat,
    markMessageAsRead,
    startTyping,
    stopTyping,
    
    // Order tracking
    joinOrderUpdates,
    leaveOrderUpdates,
    
    // Delivery tracking
    joinDeliveryTracking,
    leaveDeliveryTracking,
    updateDeliveryLocation,
    
    // User status
    updateUserStatus,
    
    // Event handling
    addEventListener,
    removeEventListener,
    
    // Utility
    reconnect,
    getConnectionStatus,
    getStats
  };
};