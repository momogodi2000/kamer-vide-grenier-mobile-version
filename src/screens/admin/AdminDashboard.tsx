import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { adminService } from '../../services/adminService';

const { width } = Dimensions.get('window');

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  userGrowth: number;
  revenueGrowth: number;
  activeUsers: number;
  pendingWithdrawals: number;
  monthlyRevenue: number[];
  usersByRole: Array<{ name: string; count: number; color: string }>;
  recentOrders: any[];
  topSellers: any[];
}

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
    monthlyRevenue: [0, 0, 0, 0, 0, 0],
    usersByRole: [],
    recentOrders: [],
    topSellers: []
  });

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // Replace with real API calls
      const stats = await adminService.getDashboardStats();
      setAdminStats(stats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      // Mock data for development
      setAdminStats({
        totalUsers: 1250,
        totalRevenue: 15750000,
        totalOrders: 3420,
        totalProducts: 8750,
        userGrowth: 12.5,
        revenueGrowth: 8.3,
        activeUsers: 892,
        pendingWithdrawals: 45,
        monthlyRevenue: [850000, 920000, 1100000, 1250000, 1400000, 1575000],
        usersByRole: [
          { name: 'Clients', count: 1050, color: '#2196F3' },
          { name: 'Livreurs', count: 120, color: '#4CAF50' },
          { name: 'Partenaires', count: 80, color: '#FF9800' }
        ],
        recentOrders: [
          { id: '12345', total: 25000, status: 'completed', customer: 'Jean Doe' },
          { id: '12346', total: 18500, status: 'pending', customer: 'Marie Smith' }
        ],
        topSellers: [
          { name: 'Electronics Plus', revenue: 850000, orders: 245 },
          { name: 'Fashion Store', revenue: 620000, orders: 180 }
        ]
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminStats();
    setRefreshing(false);
  };

  const navigateToUsers = () => {
    navigation.navigate('AdminUsers' as never);
  };

  const navigateToWithdrawals = () => {
    navigation.navigate('AdminWithdrawals' as never);
  };

  const navigateToAnalytics = () => {
    navigation.navigate('AdminAnalytics' as never);
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
      <View style={styles.statsRow}>
        <TouchableOpacity style={[styles.statCard, styles.revenueCard]} onPress={navigateToAnalytics}>
          <Icon name="attach-money" size={28} color="#4CAF50" />
          <Text style={styles.statValue}>{(adminStats.totalRevenue / 1000000).toFixed(1)}M</Text>
          <Text style={styles.statLabel}>Revenus (XAF)</Text>
          <Text style={styles.statGrowth}>+{adminStats.revenueGrowth}%</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.statCard, styles.usersCard]} onPress={navigateToUsers}>
          <Icon name="people" size={28} color="#2196F3" />
          <Text style={styles.statValue}>{adminStats.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Utilisateurs</Text>
          <Text style={styles.statGrowth}>+{adminStats.userGrowth}%</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.ordersCard]}>
          <Icon name="shopping-bag" size={28} color="#FF9800" />
          <Text style={styles.statValue}>{adminStats.totalOrders.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
          <Text style={styles.statSubtext}>Total</Text>
        </View>
        
        <View style={[styles.statCard, styles.productsCard]}>
          <Icon name="inventory" size={28} color="#9C27B0" />
          <Text style={styles.statValue}>{adminStats.totalProducts.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Produits</Text>
          <Text style={styles.statSubtext}>En ligne</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.activeCard]}>
          <Icon name="person" size={28} color="#00BCD4" />
          <Text style={styles.statValue}>{adminStats.activeUsers}</Text>
          <Text style={styles.statLabel}>Actifs</Text>
          <Text style={styles.statSubtext}>30 jours</Text>
        </View>
        
        <TouchableOpacity style={[styles.statCard, styles.withdrawalCard]} onPress={navigateToWithdrawals}>
          <Icon name="account-balance-wallet" size={28} color="#F44336" />
          <Text style={styles.statValue}>{adminStats.pendingWithdrawals}</Text>
          <Text style={styles.statLabel}>Retraits</Text>
          <Text style={styles.statSubtext}>En attente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRevenueChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Revenus des 6 derniers mois</Text>
      <LineChart
        data={{
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          datasets: [{
            data: adminStats.monthlyRevenue.map(val => val / 1000),
            strokeWidth: 3,
          }],
        }}
        width={width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="k"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#4CAF50',
          },
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderUsersChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Répartition des utilisateurs</Text>
      <PieChart
        data={adminStats.usersByRole}
        width={width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
        absolute
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={navigateToUsers}>
          <Icon name="person-add" size={24} color="#2196F3" />
          <Text style={styles.actionText}>Gérer utilisateurs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={navigateToWithdrawals}>
          <Icon name="payment" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Retraits</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={navigateToAnalytics}>
          <Icon name="analytics" size={24} color="#FF9800" />
          <Text style={styles.actionText}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.activityContainer}>
      <Text style={styles.sectionTitle}>Activité récente</Text>
      {adminStats.recentOrders.map((order) => (
        <View key={order.id} style={styles.activityItem}>
          <Icon name="shopping-bag" size={20} color="#2196F3" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Commande #{order.id}</Text>
            <Text style={styles.activitySubtitle}>{order.customer} • {order.total.toLocaleString()} XAF</Text>
          </View>
          <Text style={[styles.statusBadge, order.status === 'completed' ? styles.statusCompleted : styles.statusPending]}>
            {order.status === 'completed' ? 'Terminée' : 'En attente'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderStatsCards()}
      {renderRevenueChart()}
      {renderUsersChart()}
      {renderQuickActions()}
      {renderRecentActivity()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
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
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  revenueCard: {
    backgroundColor: '#E8F5E8',
  },
  usersCard: {
    backgroundColor: '#E3F2FD',
  },
  ordersCard: {
    backgroundColor: '#FFF3E0',
  },
  productsCard: {
    backgroundColor: '#F3E5F5',
  },
  activeCard: {
    backgroundColor: '#E0F2F1',
  },
  withdrawalCard: {
    backgroundColor: '#FFEBEE',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statGrowth: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#999',
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
  actionsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
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
  activityContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E8',
    color: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
});

export default AdminDashboard;