import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { deliveryService } from '../../services/deliveryService';

const { width } = Dimensions.get('window');

interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  monthlyEarnings: number;
  averageRating: number;
  totalDistance: number;
  activeHours: number;
  currentShift: boolean;
  pendingOrders: any[];
  completedToday: number;
  weeklyStats: number[];
  performanceRating: string;
}

const DeliveryDashboard: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalDistance: 0,
    activeHours: 0,
    currentShift: false,
    pendingOrders: [],
    completedToday: 0,
    weeklyStats: [0, 0, 0, 0, 0, 0, 0],
    performanceRating: 'Bon'
  });

  useEffect(() => {
    loadDeliveryStats();
  }, []);

  const loadDeliveryStats = async () => {
    try {
      // Replace with real API calls
      const stats = await deliveryService.getDeliveryStats();
      setDeliveryStats(stats);
    } catch (error) {
      console.error('Failed to load delivery stats:', error);
      // Mock data for development
      setDeliveryStats({
        totalDeliveries: 847,
        completedDeliveries: 789,
        pendingDeliveries: 58,
        monthlyEarnings: 185000, // Fixed monthly amount, no wallet system for delivery
        averageRating: 4.7,
        totalDistance: 2450,
        activeHours: 156,
        currentShift: false,
        completedToday: 12,
        weeklyStats: [8, 12, 15, 10, 14, 18, 12],
        performanceRating: 'Excellent',
        pendingOrders: [
          { id: '12345', pickup: 'Centre-ville', destination: 'Bonanjo', fee: 2000 },
          { id: '12346', pickup: 'Akwa', destination: 'Makepe', fee: 2000 },
          { id: '12347', pickup: 'Bonapriso', destination: 'Deido', fee: 2000 }
        ]
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeliveryStats();
    setRefreshing(false);
  };

  const toggleShift = () => {
    Alert.alert(
      deliveryStats.currentShift ? 'Terminer la journée' : 'Commencer la journée',
      deliveryStats.currentShift 
        ? 'Voulez-vous terminer votre journée de travail ?' 
        : 'Voulez-vous commencer votre journée de travail ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            setDeliveryStats(prev => ({
              ...prev,
              currentShift: !prev.currentShift
            }));
          }
        }
      ]
    );
  };

  const navigateToDeliveries = () => {
    navigation.navigate('DeliveryList' as never);
  };

  const navigateToEarnings = () => {
    navigation.navigate('EarningsHistory' as never);
  };

  const renderShiftStatus = () => (
    <View style={styles.shiftContainer}>
      <View style={styles.shiftInfo}>
        <Text style={styles.shiftTitle}>État de service</Text>
        <Text style={[styles.shiftStatus, deliveryStats.currentShift ? styles.activeShift : styles.inactiveShift]}>
          {deliveryStats.currentShift ? 'En service' : 'Hors service'}
        </Text>
        <Text style={styles.shiftSubtext}>
          {deliveryStats.currentShift 
            ? `${deliveryStats.completedToday} livraisons aujourd'hui`
            : 'Appuyez pour commencer'
          }
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.shiftButton, deliveryStats.currentShift ? styles.endShiftButton : styles.startShiftButton]}
        onPress={toggleShift}
      >
        <Icon 
          name={deliveryStats.currentShift ? 'pause' : 'play-arrow'} 
          size={24} 
          color="#ffffff" 
        />
      </TouchableOpacity>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Vos statistiques</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.deliveriesCard]}>
          <Icon name="local-shipping" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{deliveryStats.totalDeliveries}</Text>
          <Text style={styles.statLabel}>Livraisons totales</Text>
        </View>
        
        <View style={[styles.statCard, styles.earningsCard]}>
          <Icon name="account-balance" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{(deliveryStats.monthlyEarnings / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Salaire mensuel (XAF)</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.ratingCard]}>
          <Icon name="star" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{deliveryStats.averageRating}</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </View>
        
        <View style={[styles.statCard, styles.distanceCard]}>
          <Icon name="timeline" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{deliveryStats.totalDistance}</Text>
          <Text style={styles.statLabel}>Distance (km)</Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceCard = () => (
    <View style={styles.performanceContainer}>
      <Text style={styles.sectionTitle}>Performance</Text>
      <View style={styles.performanceCard}>
        <View style={styles.performanceHeader}>
          <Icon name="trending-up" size={32} color="#4CAF50" />
          <View style={styles.performanceInfo}>
            <Text style={styles.performanceRating}>{deliveryStats.performanceRating}</Text>
            <Text style={styles.performanceSubtext}>Note de performance</Text>
          </View>
        </View>
        
        <View style={styles.performanceStats}>
          <View style={styles.performanceStat}>
            <Text style={styles.performanceStatValue}>{Math.round((deliveryStats.completedDeliveries / deliveryStats.totalDeliveries) * 100)}%</Text>
            <Text style={styles.performanceStatLabel}>Taux de réussite</Text>
          </View>
          <View style={styles.performanceStat}>
            <Text style={styles.performanceStatValue}>{deliveryStats.activeHours}h</Text>
            <Text style={styles.performanceStatLabel}>Heures actives</Text>
          </View>
          <View style={styles.performanceStat}>
            <Text style={styles.performanceStatValue}>{deliveryStats.completedToday}</Text>
            <Text style={styles.performanceStatLabel}>Aujourd'hui</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderWeeklyChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Livraisons cette semaine</Text>
      <LineChart
        data={{
          labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
          datasets: [{
            data: deliveryStats.weeklyStats,
            strokeWidth: 3,
          }],
        }}
        width={width - 40}
        height={200}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#2196F3',
          },
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderPendingOrders = () => (
    <View style={styles.ordersContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Commandes en attente</Text>
        <TouchableOpacity onPress={navigateToDeliveries}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      
      {deliveryStats.pendingOrders.length > 0 ? (
        deliveryStats.pendingOrders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderItem}>
            <Icon name="local-shipping" size={20} color="#FF9800" />
            <View style={styles.orderContent}>
              <Text style={styles.orderTitle}>Commande #{order.id}</Text>
              <Text style={styles.orderRoute}>{order.pickup} → {order.destination}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderFee}>{order.fee.toLocaleString()} XAF</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Icon name="inbox" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>Aucune commande en attente</Text>
        </View>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={navigateToDeliveries}>
          <Icon name="list" size={24} color="#2196F3" />
          <Text style={styles.actionText}>Mes livraisons</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={navigateToEarnings}>
          <Icon name="attach-money" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Historique</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Icon name="help" size={24} color="#FF9800" />
          <Text style={styles.actionText}>Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderShiftStatus()}
      {renderStatsCards()}
      {renderPerformanceCard()}
      {renderWeeklyChart()}
      {renderPendingOrders()}
      {renderQuickActions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  shiftContainer: {
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftTitle: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 4,
  },
  shiftStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activeShift: {
    color: '#4CAF50',
  },
  inactiveShift: {
    color: '#ffffff',
  },
  shiftSubtext: {
    color: '#E3F2FD',
    fontSize: 14,
  },
  shiftButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  startShiftButton: {
    backgroundColor: '#4CAF50',
  },
  endShiftButton: {
    backgroundColor: '#FF5722',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 0.48,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  deliveriesCard: {
    backgroundColor: '#E3F2FD',
  },
  earningsCard: {
    backgroundColor: '#E8F5E8',
  },
  ratingCard: {
    backgroundColor: '#FFF3E0',
  },
  distanceCard: {
    backgroundColor: '#F3E5F5',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  performanceContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  performanceCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceInfo: {
    marginLeft: 16,
  },
  performanceRating: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  performanceSubtext: {
    fontSize: 12,
    color: '#666',
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  performanceStatLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  ordersContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderContent: {
    flex: 1,
    marginLeft: 12,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderRoute: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderFee: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  actionsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 0.3,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DeliveryDashboard;