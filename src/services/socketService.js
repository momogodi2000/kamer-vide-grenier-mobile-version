import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { Platform } from 'react-native';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.joinedRooms = new Set();
    this.connectionState = 'disconnected';
    this.networkState = null;

    this.setupNetworkListener();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.networkState = state;
      
      if (state.isConnected && !this.isConnected) {
        console.log('Network connected, attempting to connect socket');
        this.connect();
      } else if (!state.isConnected && this.isConnected) {
        console.log('Network disconnected');
        this.connectionState = 'network_disconnected';
      }
    });
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('No auth token available for socket connection');
        return;
      }

      if (this.socket?.connected) {
        return;
      }

      // Check network connectivity first
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        console.warn('No network connection available');
        this.connectionState = 'network_disconnected';
        return;
      }

      const serverUrl = __DEV__ 
        ? (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001')
        : 'https://api.kamervidgrenier.com';
      
      this.connectionState = 'connecting';
      
      this.socket = io(serverUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        maxReconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventHandlers();
      
      console.log('Socket connection initiated');
    } catch (error) {
      console.error('Error connecting socket:', error);
      this.connectionState = 'error';
    }
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      
      // Rejoin previous rooms
      this.rejoinRooms();
      
      // Emit connected event
      this.emit('socket_connected', {
        socketId: this.socket.id,
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.connectionState = 'disconnected';
      
      this.emit('socket_disconnected', { 
        reason,
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.connectionState = 'error';
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.connectionState = 'max_attempts_reached';
        this.emit('socket_max_reconnection_failed');
      }
      
      this.emit('socket_connection_error', { 
        error: error.message, 
        attempts: this.reconnectAttempts 
      });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.emit('socket_reconnected', { attempts: attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
      this.connectionState = 'reconnecting';
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket_error', { error: error.message });
    });

    // Application-specific events
    this.socket.on('connected', (data) => {
      console.log('Server connection confirmed:', data);
      this.emit('server_connected', data);
    });

    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.emit('user_stopped_typing', data);
    });

    this.socket.on('user_joined_chat', (data) => {
      this.emit('user_joined_chat', data);
    });

    this.socket.on('order_updated', (data) => {
      this.emit('order_updated', data);
    });

    this.socket.on('delivery_updated', (data) => {
      this.emit('delivery_updated', data);
    });

    this.socket.on('delivery_location_updated', (data) => {
      this.emit('delivery_location_updated', data);
    });

    this.socket.on('status_updated', (data) => {
      this.emit('user_status_updated', data);
    });

    this.socket.on('pending_notifications', (data) => {
      this.emit('pending_notifications', data);
    });

    // Error events from server
    this.socket.on('error', (data) => {
      console.error('Socket server error:', data);
      this.emit('socket_server_error', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionState = 'disconnected';
      this.joinedRooms.clear();
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      
      // Clean up empty sets
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event callback for ${event}:`, error);
        }
      });
    }
  }

  // Chat functionality
  joinChat(chatId, orderId) {
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot join chat');
      return;
    }

    this.socket.emit('join_chat', { chatId, orderId });
    this.joinedRooms.add(`chat:${chatId}`);
    
    console.log(`Joined chat ${chatId}`);
  }

  leaveChat(chatId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit('leave_chat', { chatId });
    this.joinedRooms.delete(`chat:${chatId}`);
    
    console.log(`Left chat ${chatId}`);
  }

  sendMessage(chatId, message, type = 'text') {
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot send message');
      return false;
    }

    this.socket.emit('send_message', { chatId, message, type });
    return true;
  }

  markMessageAsRead(messageId, chatId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit('message_read', { messageId, chatId });
  }

  startTyping(chatId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit('typing_start', { chatId });
  }

  stopTyping(chatId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit('typing_stop', { chatId });
  }

  // Order tracking
  joinOrderUpdates(orderId) {
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot join order updates');
      return;
    }

    this.socket.emit('join_order_updates', { orderId });
    this.joinedRooms.add(`order:${orderId}`);
    
    console.log(`Joined order updates ${orderId}`);
  }

  leaveOrderUpdates(orderId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit('leave_order_updates', { orderId });
    this.joinedRooms.delete(`order:${orderId}`);
    
    console.log(`Left order updates ${orderId}`);
  }

  // Delivery tracking
  joinDeliveryTracking(deliveryId) {
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot join delivery tracking');
      return;
    }

    this.socket.emit('join_delivery_tracking', { deliveryId });
    this.joinedRooms.add(`delivery:${deliveryId}`);
    
    console.log(`Joined delivery tracking ${deliveryId}`);
  }

  leaveDeliveryTracking(deliveryId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit('leave_delivery_tracking', { deliveryId });
    this.joinedRooms.delete(`delivery:${deliveryId}`);
    
    console.log(`Left delivery tracking ${deliveryId}`);
  }

  updateDeliveryLocation(deliveryId, location) {
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot update delivery location');
      return;
    }

    this.socket.emit('delivery_location_update', { 
      deliveryId, 
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp || new Date().toISOString()
      }
    });
  }

  // User status
  updateUserStatus(status) {
    if (!this.isConnected) {
      return;
    }

    const validStatuses = ['online', 'away', 'busy', 'offline'];
    if (!validStatuses.includes(status)) {
      console.warn('Invalid status:', status);
      return;
    }

    this.socket.emit('user_status_update', { status });
  }

  // Utility methods
  rejoinRooms() {
    console.log('Rejoining rooms:', Array.from(this.joinedRooms));
    
    this.joinedRooms.forEach(room => {
      if (room.startsWith('chat:')) {
        const chatId = room.replace('chat:', '');
        this.socket.emit('join_chat', { chatId });
      } else if (room.startsWith('order:')) {
        const orderId = room.replace('order:', '');
        this.socket.emit('join_order_updates', { orderId });
      } else if (room.startsWith('delivery:')) {
        const deliveryId = room.replace('delivery:', '');
        this.socket.emit('join_delivery_tracking', { deliveryId });
      }
    });
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      joinedRooms: Array.from(this.joinedRooms),
      networkState: this.networkState
    };
  }

  // Retry connection with exponential backoff
  async reconnect() {
    if (this.connectionState === 'connecting' || this.connectionState === 'reconnecting') {
      return;
    }

    // Check network first
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.warn('Cannot reconnect: no network connection');
      return;
    }

    if (this.socket) {
      this.disconnect();
    }
    
    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Reconnecting in ${backoffDelay}ms...`);
    
    setTimeout(() => {
      this.connect();
    }, backoffDelay);
  }

  // Background state handling
  enterBackground() {
    // Reduce socket activity when app goes to background
    if (this.isConnected) {
      this.updateUserStatus('away');
    }
  }

  enterForeground() {
    // Resume full socket activity when app comes to foreground
    if (!this.isConnected) {
      this.reconnect();
    } else {
      this.updateUserStatus('online');
    }
  }

  // Cleanup method
  cleanup() {
    this.disconnect();
    this.listeners.clear();
    this.joinedRooms.clear();
  }

  // Health check
  ping() {
    if (this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Get statistics
  getStats() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      joinedRoomsCount: this.joinedRooms.size,
      listenersCount: this.listeners.size,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      networkType: this.networkState?.type,
      isNetworkConnected: this.networkState?.isConnected
    };
  }
}

export default new SocketService();