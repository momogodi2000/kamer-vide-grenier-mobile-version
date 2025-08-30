import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { walletService } from '../../services/walletService';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';

const { width } = Dimensions.get('window');

interface ClientStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  wishlistCount: number;
  savedCards: number;
  activeSubscriptions: number;
  walletBalance: number;
  recentOrders: any[];
  recommendations: any[];
  favoriteCategories: string[];
}

const ClientDashboard: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [clientStats, setClientStats] = useState<ClientStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    wishlistCount: 0,
    savedCards: 0,
    activeSubscriptions: 0,
    walletBalance: 0,
    recentOrders: [],
    recommendations: [],
    favoriteCategories: []
  });

  useEffect(() => {
    loadClientStats();
  }, []);

  const loadClientStats = async () => {
    try {
      // Replace with real API calls
      const [wallet, orders, products] = await Promise.all([
        walletService.getWallet(),
        orderService.getMyOrders(),
        productService.getFeaturedProducts()
      ]);
      
      setClientStats({
        totalOrders: orders.data?.length || 0,
        completedOrders: orders.data?.filter((o: any) => o.status === 'completed').length || 0,
        pendingOrders: orders.data?.filter((o: any) => o.status === 'pending').length || 0,
        totalSpent: orders.data?.reduce((sum: number, order: any) => sum + order.total, 0) || 0,
        loyaltyPoints: user?.loyalty_points || 0,
        wishlistCount: 12, // Replace with real data
        savedCards: 2, // Replace with real data  
        activeSubscriptions: 1, // Replace with real data
        walletBalance: wallet.data?.balance || 0,
        recentOrders: orders.data?.slice(0, 3) || [],
        recommendations: products.data?.slice(0, 3) || [],
        favoriteCategories: ['Électronique', 'Mode', 'Maison']
      });
    } catch (error) {
      console.error('Failed to load client stats:', error);
      // Mock data for development
      setClientStats({
        totalOrders: 24,
        completedOrders: 18,
        pendingOrders: 6,
        totalSpent: 485000,
        loyaltyPoints: 1250,
        wishlistCount: 12,
        savedCards: 2,
        activeSubscriptions: 1,
        walletBalance: 45000,
        recentOrders: [
          { id: '12345', total: 25000, status: 'completed', product: 'iPhone 13 Pro' },
          { id: '12346', total: 18500, status: 'pending', product: 'Nike Air Max' }
        ],
        recommendations: [
          { id: '1', name: 'MacBook Pro', price: 850000, image: 'laptop' },
          { id: '2', name: 'Samsung Galaxy', price: 420000, image: 'phone' }
        ],
        favoriteCategories: ['Électronique', 'Mode', 'Maison']
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClientStats();
    setRefreshing(false);
  };

  const navigateToOrders = () => {
    navigation.navigate('Orders' as never);
  };

  const navigateToWallet = () => {
    navigation.navigate('Wallet' as never);
  };

  const navigateToWishlist = () => {
    navigation.navigate('Wishlist' as never);
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile' as never);
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeText}>Bonjour,</Text>
        <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
        <Text style={styles.welcomeSubtext}>Découvrez nos dernières offres</Text>
      </View>
      <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
        <Icon name="account-circle" size={32} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <TouchableOpacity style={[styles.statCard, styles.ordersCard]} onPress={navigateToOrders}>
          <Icon name="shopping-bag" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{clientStats.totalOrders}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.statCard, styles.wishlistCard]} onPress={navigateToWishlist}>
          <Icon name="favorite" size={24} color="#E91E63" />
          <Text style={styles.statValue}>{clientStats.wishlistCount}</Text>
          <Text style={styles.statLabel}>Favoris</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.loyaltyCard]}>
          <Icon name="card-giftcard" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{clientStats.loyaltyPoints.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Points fidélité</Text>
        </View>
        
        <TouchableOpacity style={[styles.statCard, styles.walletCard]} onPress={navigateToWallet}>
          <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{(clientStats.walletBalance / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Portefeuille (XAF)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrdersSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>Vos commandes</Text>
      <View style={styles.ordersSummary}>
        <View style={styles.orderStat}>
          <View style={[styles.orderIndicator, styles.completedIndicator]} />
          <Text style={styles.orderStatNumber}>{clientStats.completedOrders}</Text>
          <Text style={styles.orderStatLabel}>Terminées</Text>
        </View>
        
        <View style={styles.orderStat}>
          <View style={[styles.orderIndicator, styles.pendingIndicator]} />
          <Text style={styles.orderStatNumber}>{clientStats.pendingOrders}</Text>
          <Text style={styles.orderStatLabel}>En cours</Text>
        </View>
        
        <View style={styles.orderStat}>
          <View style={[styles.orderIndicator, styles.totalIndicator]} />
          <Text style={styles.orderStatNumber}>{(clientStats.totalSpent / 1000).toFixed(0)}k</Text>
          <Text style={styles.orderStatLabel}>Total (XAF)</Text>
        </View>
      </View>
    </View>
  );

  const renderRecentOrders = () => (
    <View style={styles.recentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Commandes récentes</Text>
        <TouchableOpacity onPress={navigateToOrders}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      
      {clientStats.recentOrders.map((order) => (
        <View key={order.id} style={styles.orderItem}>
          <Icon name="shopping-bag" size={20} color="#2196F3" />
          <View style={styles.orderContent}>
            <Text style={styles.orderTitle}>Commande #{order.id}</Text>
            <Text style={styles.orderSubtitle}>{order.product}</Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderAmount}>{order.total.toLocaleString()} XAF</Text>
            <Text style={[
              styles.orderStatus,
              order.status === 'completed' ? styles.statusCompleted : styles.statusPending
            ]}>
              {order.status === 'completed' ? 'Terminée' : 'En cours'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.recommendationsContainer}>
      <Text style={styles.sectionTitle}>Recommandé pour vous</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
        {clientStats.recommendations.map((product) => (
          <TouchableOpacity key={product.id} style={styles.recommendationCard}>
            <View style={styles.productImagePlaceholder}>
              <Icon name={product.image} size={32} color="#666" />
            </View>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price.toLocaleString()} XAF</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={navigateToOrders}>
          <Icon name="shopping-bag" size={24} color="#2196F3" />
          <Text style={styles.actionText}>Mes commandes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={navigateToWallet}>
          <Icon name="payment" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Portefeuille</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={navigateToWishlist}>
          <Icon name="favorite" size={24} color="#E91E63" />
          <Text style={styles.actionText}>Favoris</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={navigateToProfile}>
          <Icon name="settings" size={24} color="#FF9800" />
          <Text style={styles.actionText}>Paramètres</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderWelcomeSection()}
      {renderQuickStats()}
      {renderOrdersSummary()}
      {renderRecentOrders()}
      {renderRecommendations()}
      {renderQuickActions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeContainer: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 16,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  welcomeSubtext: {
    color: '#E3F2FD',
    fontSize: 14,
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    margin: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 0.48,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  wishlistCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  loyaltyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  walletCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  summaryContainer: {
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
  ordersSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderStat: {
    alignItems: 'center',
  },
  orderIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  completedIndicator: {
    backgroundColor: '#4CAF50',
  },
  pendingIndicator: {
    backgroundColor: '#FF9800',
  },
  totalIndicator: {
    backgroundColor: '#2196F3',
  },
  orderStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recentContainer: {
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
  orderSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderStatus: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E8',
    color: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  recommendationsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  recommendationsScroll: {
    marginTop: 8,
  },
  recommendationCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ClientDashboard;