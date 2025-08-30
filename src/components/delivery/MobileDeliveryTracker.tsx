import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import AnimatedInput from '../ui/AnimatedInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAccessibilityContext } from '../../hooks/useAccessibility';

const { width: screenWidth } = Dimensions.get('window');

interface DeliveryStatus {
  id: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  notes?: string;
}

interface Delivery {
  id: string;
  orderId: string;
  trackingNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    image: string;
  }>;
  agent?: {
    id: string;
    name: string;
    phone: string;
    photo: string;
    rating: number;
    vehicle: string;
  };
  pickup: {
    address: string;
    scheduledTime: string;
    actualTime?: string;
  };
  delivery: {
    address: string;
    scheduledTime: string;
    estimatedTime?: string;
    instructions?: string;
  };
  status: DeliveryStatus['status'];
  timeline: DeliveryStatus[];
  estimatedDuration: number;
  distance: number;
  fee: number;
}

interface MobileDeliveryTrackerProps {
  deliveryId?: string;
  trackingNumber?: string;
  userRole: 'client' | 'delivery' | 'admin';
  onStatusUpdate?: (deliveryId: string, status: DeliveryStatus['status']) => void;
}

const MobileDeliveryTracker: React.FC<MobileDeliveryTrackerProps> = ({
  deliveryId,
  trackingNumber,
  userRole,
  onStatusUpdate,
}) => {
  const { t } = useTranslation(['delivery', 'common']);
  const { 
    announceForAccessibility, 
    isScreenReaderEnabled,
    prefersReducedMotion 
  } = useAccessibilityContext();
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingInput, setTrackingInput] = useState(trackingNumber || '');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mock data
  const mockDelivery: Delivery = {
    id: 'DEL-2024-001234',
    orderId: 'ORD-2024-005678',
    trackingNumber: 'KVG-TRACK-789012',
    customer: {
      name: 'Marie Kouam',
      phone: '+237 677 123 456',
      address: 'Bastos, Yaoundé',
    },
    items: [
      {
        id: '1',
        name: 'iPhone 13 Pro Max 256GB',
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
      {
        id: '2',
        name: 'Protective Case',
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
    ],
    agent: {
      id: 'AGT-001',
      name: 'Jean-Paul Mbassi',
      phone: '+237 690 987 654',
      photo: '/api/placeholder/50/50',
      rating: 4.8,
      vehicle: 'Moto Yamaha (YDE-2024-ABC)',
    },
    pickup: {
      address: 'Carrefour Warda, Douala',
      scheduledTime: '2024-01-15T09:00:00Z',
      actualTime: '2024-01-15T09:15:00Z',
    },
    delivery: {
      address: 'Bastos, Yaoundé',
      scheduledTime: '2024-01-15T15:00:00Z',
      estimatedTime: '2024-01-15T14:45:00Z',
      instructions: 'Appeler 15 minutes avant l\'arrivée. Immeuble bleu, 3ème étage.',
    },
    status: 'in_transit',
    timeline: [
      {
        id: '1',
        status: 'pending',
        timestamp: '2024-01-15T08:00:00Z',
        notes: 'Commande créée',
      },
      {
        id: '2',
        status: 'assigned',
        timestamp: '2024-01-15T08:30:00Z',
        notes: 'Livreur assigné',
      },
      {
        id: '3',
        status: 'picked_up',
        timestamp: '2024-01-15T09:15:00Z',
        location: {
          lat: 4.0511,
          lng: 9.7679,
          address: 'Carrefour Warda, Douala',
        },
        notes: 'Colis récupéré',
      },
      {
        id: '4',
        status: 'in_transit',
        timestamp: '2024-01-15T10:30:00Z',
        location: {
          lat: 3.8480,
          lng: 11.5021,
          address: 'En route vers Yaoundé',
        },
        notes: 'En route',
      },
    ],
    estimatedDuration: 360,
    distance: 250,
    fee: 15000,
  };

  const fetchDelivery = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDelivery(mockDelivery);
    setLoading(false);

    if (isScreenReaderEnabled) {
      announceForAccessibility(t('delivery:tracking.loaded'));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDelivery();
    setRefreshing(false);
  };

  const trackByNumber = async () => {
    if (!trackingInput.trim()) return;
    await fetchDelivery();
  };

  useEffect(() => {
    if (deliveryId) {
      fetchDelivery();
    }
  }, [deliveryId]);

  // Pulse animation for active status
  useEffect(() => {
    if (delivery && !prefersReducedMotion) {
      if (['in_transit', 'out_for_delivery'].includes(delivery.status)) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        pulse.start();

        return () => pulse.stop();
      }
    }
  }, [delivery?.status, pulseAnim, prefersReducedMotion]);

  // Progress bar animation
  useEffect(() => {
    if (delivery && !prefersReducedMotion) {
      const statusProgress = {
        'pending': 0,
        'assigned': 0.2,
        'picked_up': 0.4,
        'in_transit': 0.6,
        'out_for_delivery': 0.8,
        'delivered': 1,
        'failed': 0,
      };

      Animated.timing(progressAnim, {
        toValue: statusProgress[delivery.status] || 0,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [delivery?.status, progressAnim, prefersReducedMotion]);

  const getStatusColor = (status: DeliveryStatus['status']) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#3B82F6';
      case 'picked_up': return '#8B5CF6';
      case 'in_transit': return '#6366F1';
      case 'out_for_delivery': return '#F97316';
      case 'delivered': return '#10B981';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: DeliveryStatus['status']) => {
    switch (status) {
      case 'pending': return '⏰';
      case 'assigned': return '👤';
      case 'picked_up': return '📦';
      case 'in_transit': return '🚚';
      case 'out_for_delivery': return '🏃';
      case 'delivered': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-CM', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`;
    }
    return `${amount} FCFA`;
  };

  const callAgent = () => {
    if (delivery?.agent) {
      Alert.alert(
        t('delivery:agent.call'),
        t('delivery:agent.callConfirm', { name: delivery.agent.name }),
        [
          { text: t('common:cancel'), style: 'cancel' },
          { 
            text: t('delivery:agent.call'), 
            onPress: () => Linking.openURL(`tel:${delivery.agent!.phone}`)
          },
        ]
      );
    }
  };

  const callCustomer = () => {
    if (delivery?.customer) {
      Alert.alert(
        t('delivery:customer.call'),
        t('delivery:customer.callConfirm', { name: delivery.customer.name }),
        [
          { text: t('common:cancel'), style: 'cancel' },
          { 
            text: t('delivery:customer.call'), 
            onPress: () => Linking.openURL(`tel:${delivery.customer.phone}`)
          },
        ]
      );
    }
  };

  const updateStatus = (newStatus: DeliveryStatus['status']) => {
    if (delivery) {
      onStatusUpdate?.(delivery.id, newStatus);
      announceForAccessibility(
        t('delivery:status.updated', { status: t(`delivery:status.${newStatus}`) })
      );
    }
  };

  if (!delivery && !loading) {
    return (
      <View style={styles.container}>
        <AnimatedCard style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>
            {t('delivery:tracking.title')}
          </Text>
          <Text style={styles.trackingSubtitle}>
            {t('delivery:tracking.description')}
          </Text>
          
          <AnimatedInput
            label={t('delivery:tracking.trackingNumber')}
            placeholder={t('delivery:tracking.enterTracking')}
            value={trackingInput}
            onChangeText={setTrackingInput}
            containerStyle={styles.trackingInput}
          />
          
          <AnimatedButton
            title={t('delivery:tracking.track')}
            onPress={trackByNumber}
            variant="primary"
            fullWidth
            disabled={!trackingInput.trim()}
            style={styles.trackButton}
          />
        </AnimatedCard>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" text={t('delivery:tracking.loading')} />
      </View>
    );
  }

  if (!delivery) return null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Status */}
      <AnimatedCard style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Animated.View
            style={[
              styles.statusIcon,
              { 
                backgroundColor: getStatusColor(delivery.status),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.statusIconText}>
              {getStatusIcon(delivery.status)}
            </Text>
          </Animated.View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {t(`delivery:status.${delivery.status}`)}
            </Text>
            <Text style={styles.trackingNumber}>
              {delivery.trackingNumber}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getStatusColor(delivery.status),
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{delivery.distance} km</Text>
            <Text style={styles.statLabel}>{t('delivery:tracking.distance')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {delivery.delivery.estimatedTime ? 
                formatDate(delivery.delivery.estimatedTime) : 
                t('common:calculating')}
            </Text>
            <Text style={styles.statLabel}>{t('delivery:tracking.estimatedDelivery')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(delivery.fee)}</Text>
            <Text style={styles.statLabel}>{t('delivery:tracking.deliveryFee')}</Text>
          </View>
        </View>
      </AnimatedCard>

      {/* Agent Info */}
      {delivery.agent && (
        <AnimatedCard
          style={styles.agentCard}
          interactive
          onPress={() => setExpandedSection(expandedSection === 'agent' ? null : 'agent')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('delivery:agent.title')}</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'agent' ? '▼' : '▶'}
            </Text>
          </View>
          
          <View style={styles.agentInfo}>
            <Image source={{ uri: delivery.agent.photo }} style={styles.agentPhoto} />
            <View style={styles.agentDetails}>
              <Text style={styles.agentName}>{delivery.agent.name}</Text>
              <Text style={styles.agentVehicle}>{delivery.agent.vehicle}</Text>
              <View style={styles.agentRating}>
                <Text style={styles.ratingText}>⭐ {delivery.agent.rating}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={callAgent}
              accessibilityRole="button"
              accessibilityLabel={t('delivery:agent.call')}
            >
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>

          {expandedSection === 'agent' && (
            <View style={styles.expandedContent}>
              <View style={styles.agentStats}>
                <Text style={styles.agentStatsText}>
                  {t('delivery:agent.totalDeliveries')}: 1,245
                </Text>
                <Text style={styles.agentStatsText}>
                  {t('delivery:agent.successRate')}: 98.5%
                </Text>
              </View>
            </View>
          )}
        </AnimatedCard>
      )}

      {/* Timeline */}
      <AnimatedCard style={styles.timelineCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('delivery:tracking.timeline')}</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'timeline' ? '▼' : '▶'}
          </Text>
        </View>

        <View style={styles.timeline}>
          {delivery.timeline.slice(-3).map((event, index) => (
            <View key={event.id} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineIcon,
                  { backgroundColor: getStatusColor(event.status) },
                ]}
              >
                <Text style={styles.timelineIconText}>
                  {getStatusIcon(event.status)}
                </Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  {t(`delivery:status.${event.status}`)}
                </Text>
                <Text style={styles.timelineTime}>
                  {formatDate(event.timestamp)}
                </Text>
                {event.location && (
                  <Text style={styles.timelineLocation}>
                    📍 {event.location.address}
                  </Text>
                )}
                {event.notes && (
                  <Text style={styles.timelineNotes}>{event.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setExpandedSection(expandedSection === 'timeline' ? null : 'timeline')}
        >
          <Text style={styles.viewAllButtonText}>
            {expandedSection === 'timeline' ? 
              t('delivery:timeline.showLess') : 
              t('delivery:timeline.viewAll')}
          </Text>
        </TouchableOpacity>
      </AnimatedCard>

      {/* Items */}
      <AnimatedCard style={styles.itemsCard}>
        <Text style={styles.cardTitle}>{t('delivery:items.title')}</Text>
        
        <View style={styles.itemsList}>
          {delivery.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>
                  {t('delivery:items.quantity')}: {item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </AnimatedCard>

      {/* Map Placeholder */}
      <AnimatedCard style={styles.mapCard}>
        <Text style={styles.cardTitle}>{t('delivery:map.title')}</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>
            {t('delivery:map.integration')}
          </Text>
        </View>
      </AnimatedCard>

      {/* Action Buttons for Delivery Agent */}
      {userRole === 'delivery' && delivery.status !== 'delivered' && delivery.status !== 'failed' && (
        <AnimatedCard style={styles.actionsCard}>
          <Text style={styles.cardTitle}>{t('delivery:actions.title')}</Text>
          
          <View style={styles.actionButtons}>
            {delivery.status === 'assigned' && (
              <AnimatedButton
                title={t('delivery:actions.markPickedUp')}
                onPress={() => updateStatus('picked_up')}
                variant="primary"
                fullWidth
                style={styles.actionButton}
              />
            )}
            {delivery.status === 'picked_up' && (
              <AnimatedButton
                title={t('delivery:actions.markInTransit')}
                onPress={() => updateStatus('in_transit')}
                variant="primary"
                fullWidth
                style={styles.actionButton}
              />
            )}
            {delivery.status === 'in_transit' && (
              <AnimatedButton
                title={t('delivery:actions.markOutForDelivery')}
                onPress={() => updateStatus('out_for_delivery')}
                variant="primary"
                fullWidth
                style={styles.actionButton}
              />
            )}
            {delivery.status === 'out_for_delivery' && (
              <AnimatedButton
                title={t('delivery:actions.markDelivered')}
                onPress={() => updateStatus('delivered')}
                variant="success"
                fullWidth
                style={styles.actionButton}
              />
            )}
            
            <View style={styles.secondaryActions}>
              <AnimatedButton
                title={t('delivery:actions.callCustomer')}
                onPress={callCustomer}
                variant="outline"
                style={styles.secondaryButton}
              />
              <AnimatedButton
                title={t('delivery:actions.reportIssue')}
                onPress={() => updateStatus('failed')}
                variant="outline"
                style={styles.secondaryButton}
              />
            </View>
          </View>
        </AnimatedCard>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  trackingCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  trackingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  trackingInput: {
    marginBottom: 16,
  },
  trackButton: {
    marginTop: 8,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusIconText: {
    fontSize: 24,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  agentCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  expandIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  agentPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  agentVehicle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  agentRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 18,
  },
  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  agentStats: {
    paddingTop: 16,
  },
  agentStatsText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timelineCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  timeline: {
    paddingHorizontal: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIconText: {
    fontSize: 14,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 11,
    color: '#3B82F6',
    marginBottom: 2,
  },
  timelineNotes: {
    fontSize: 11,
    color: '#6B7280',
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  itemsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  itemsList: {
    marginTop: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  mapCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  actionButtons: {
    marginTop: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  bottomPadding: {
    height: 32,
  },
});

export default MobileDeliveryTracker;