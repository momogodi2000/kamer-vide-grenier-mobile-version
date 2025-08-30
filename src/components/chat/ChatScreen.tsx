import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../hooks/useSocket';
import { useOffline } from '../../hooks/useOffline';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  type: 'text' | 'image' | 'file' | 'system';
  sentAt: string;
  readAt?: string;
  deliveredAt?: string;
  Sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _isTemp?: boolean;
  _status?: 'pending' | 'sent' | 'delivered' | 'read';
}

interface RouteParams {
  chatId: string;
  orderId?: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isOnline?: boolean;
  };
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { chatId, orderId, otherUser } = route.params as RouteParams;

  const {
    sendMessage,
    joinChat,
    leaveChat,
    markMessageAsRead,
    startTyping,
    stopTyping,
    addEventListener,
    removeEventListener,
    isConnected,
    connectionState
  } = useSocket();

  const {
    isOffline,
    getCachedMessages,
    sendMessageOffline
  } = useOffline();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Failed to load current user:', error);
      }
    };
    
    loadCurrentUser();
  }, []);
    try {
      setLoading(true);
      
      if (!isOffline) {
        // Load from server
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data.data.messages);
        } else {
          throw new Error('Failed to load messages');
        }
      } else {
        // Load from cache
        const cachedMessages = await getCachedMessages(chatId);
        setMessages(cachedMessages || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      // Try to load from cache as fallback
      const cachedMessages = await getCachedMessages(chatId);
      setMessages(cachedMessages || []);
    } finally {
      setLoading(false);
    }
  }, [chatId, isOffline, getCachedMessages]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Failed to load current user:', error);
      }
    };
    
    loadCurrentUser();
  }, []);

  // Join chat and set up event listeners
  useEffect(() => {
    if (chatId) {
      joinChat(chatId, orderId);
      loadMessages();

      // Socket event listeners
      const handleNewMessage = async (data: { message: Message; chatId: string }) => {
        if (data.chatId === chatId) {
          setMessages(prev => {
            // Check if message already exists (avoid duplicates)
            const exists = prev.find(m => m.id === data.message.id);
            if (exists) return prev;
            
            return [...prev, data.message];
          });
          
          // Mark as read if not from current user
          const currentUser = JSON.parse(await AsyncStorage.getItem('user') || '{}');
          if (data.message.senderId !== currentUser.id) {
            markMessageAsRead(data.message.id, chatId);
          }
        }
      };

      const handleMessageRead = (data: { messageId: string; readBy: string; readAt: string }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, readAt: data.readAt, _status: 'read' }
              : msg
          )
        );
      };

      const handleUserTyping = (data: { userId: string; user: { firstName: string } }) => {
        if (data.userId === otherUser.id) {
          setOtherUserTyping(true);
        }
      };

      const handleUserStoppedTyping = (data: { userId: string }) => {
        if (data.userId === otherUser.id) {
          setOtherUserTyping(false);
        }
      };

      addEventListener('new_message', handleNewMessage);
      addEventListener('message_read', handleMessageRead);
      addEventListener('user_typing', handleUserTyping);
      addEventListener('user_stopped_typing', handleUserStoppedTyping);

      return () => {
        removeEventListener('new_message', handleNewMessage);
        removeEventListener('message_read', handleMessageRead);
        removeEventListener('user_typing', handleUserTyping);
        removeEventListener('user_stopped_typing', handleUserStoppedTyping);
        leaveChat(chatId);
      };
    }
  }, [chatId, orderId, otherUser.id, joinChat, leaveChat, loadMessages, addEventListener, removeEventListener, markMessageAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      chatId,
      senderId: currentUser?.id || '',
      message: messageText,
      type: 'text',
      sentAt: new Date().toISOString(),
      Sender: {
        id: currentUser?.id || '',
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || ''
      },
      _isTemp: true,
      _status: 'pending'
    };

    // Add message optimistically
    setMessages(prev => [...prev, tempMessage]);

    try {
      if (isConnected && !isOffline) {
        // Send via socket
        const sent = sendMessage(chatId, messageText, 'text');
        if (!sent) {
          throw new Error('Failed to send message');
        }
        
        // Update message status
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, _status: 'sent' }
              : msg
          )
        );
      } else {
        // Send offline
        await sendMessageOffline(chatId, messageText);
        
        // Update message status
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, _status: 'pending' }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert(
        t('common.error'),
        isOffline ? t('chat.messageSavedOffline') : t('chat.messageSendFailed')
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping && isConnected) {
      setIsTyping(true);
      startTyping(chatId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (isConnected) {
        stopTyping(chatId);
      }
    }, 3000);
  };

  const getConnectionStatusColor = () => {
    if (isOffline) return '#ef4444'; // red
    if (isConnected) return '#10b981'; // green
    return '#f59e0b'; // yellow
  };

  const getMessageStatus = (message: Message) => {
    if (message._isTemp) {
      if (message._status === 'pending') {
        return <Icon name="time-outline" size={14} color="#9ca3af" />;
      }
      if (message._status === 'sent') {
        return <Icon name="checkmark-outline" size={14} color="#6b7280" />;
      }
    }
    
    if (message.readAt) {
      return <Icon name="checkmark-done-outline" size={14} color="#3b82f6" />;
    }
    
    if (message.deliveredAt) {
      return <Icon name="checkmark-done-outline" size={14} color="#6b7280" />;
    }
    
    return <Icon name="checkmark-outline" size={14} color="#6b7280" />;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isCurrentUser = currentUser && message.senderId === currentUser.id;
    
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          marginVertical: 4,
          paddingHorizontal: 16
        }}
      >
        <View
          style={{
            maxWidth: '80%',
            backgroundColor: isCurrentUser ? '#3b82f6' : '#f3f4f6',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderBottomRightRadius: isCurrentUser ? 4 : 16,
            borderBottomLeftRadius: isCurrentUser ? 16 : 4
          }}
        >
          <Text
            style={{
              color: isCurrentUser ? 'white' : '#1f2937',
              fontSize: 16,
              lineHeight: 20
            }}
          >
            {message.message}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: 4
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                marginRight: 4
              }}
            >
              {formatTime(message.sentAt)}
            </Text>
            {isCurrentUser && getMessageStatus(message)}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!otherUserTyping) return null;

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginVertical: 4,
          paddingHorizontal: 16
        }}
      >
        <View
          style={{
            backgroundColor: '#f3f4f6',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderBottomLeftRadius: 4
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#6b7280', marginRight: 2 }}>•</Text>
            <Text style={{ fontSize: 16, color: '#6b7280', marginRight: 2 }}>•</Text>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>•</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 16, color: '#6b7280' }}>
            {t('chat.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb'
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
          >
            <Icon name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          
          <View style={{ position: 'relative', marginRight: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                {otherUser.firstName.charAt(0)}{otherUser.lastName.charAt(0)}
              </Text>
            </View>
            {otherUser.isOnline && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#10b981',
                  borderWidth: 2,
                  borderColor: 'white'
                }}
              />
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
              {otherUser.firstName} {otherUser.lastName}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>
              {otherUserTyping 
                ? t('chat.typing')
                : otherUser.isOnline 
                  ? t('chat.online') 
                  : t('chat.offline')
              }
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginRight: 8,
              backgroundColor: getConnectionStatusColor()
            }}
          />
          
          <TouchableOpacity style={{ padding: 8 }}>
            <Icon name="call-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={{ padding: 8 }}>
            <Icon name="videocam-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {error && (
          <View
            style={{
              backgroundColor: '#fef2f2',
              borderWidth: 1,
              borderColor: '#fecaca',
              borderRadius: 8,
              padding: 12,
              margin: 16
            }}
          >
            <Text style={{ color: '#dc2626', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 8 }}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Message Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb'
          }}
        >
          <TouchableOpacity style={{ padding: 8, marginRight: 8 }}>
            <Icon name="attach-outline" size={24} color="#6b7280" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              value={newMessage}
              onChangeText={(text) => {
                setNewMessage(text);
                handleTyping();
              }}
              placeholder={t('chat.typeMessage')}
              placeholderTextColor="#9ca3af"
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                maxHeight: 100,
                minHeight: 44
              }}
            />
          </View>

          <TouchableOpacity style={{ padding: 8, marginRight: 8 }}>
            <Icon name="happy-outline" size={24} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: newMessage.trim() ? '#3b82f6' : '#e5e7eb',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon 
                name="send" 
                size={20} 
                color={newMessage.trim() ? 'white' : '#9ca3af'} 
              />
            )}
          </TouchableOpacity>
        </View>

        {isOffline && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: '#fef3c7',
              borderTopWidth: 1,
              borderTopColor: '#f59e0b'
            }}
          >
            <Icon name="wifi-outline" size={16} color="#f59e0b" />
            <Text style={{ marginLeft: 8, color: '#f59e0b', fontSize: 14 }}>
              {t('chat.offlineMode')}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}