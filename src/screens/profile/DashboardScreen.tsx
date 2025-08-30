import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
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
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getMyProducts } from '../../store/slices/productSlice';
import { getMySales, getOrderStatistics } from '../../store/slices/orderSlice';
import { 
  syncService, 
  securityService,
  biometricService 
} from '../../services';
import { walletService, Wallet, Withdrawal } from '../../services/walletService';
  // (removed duplicate wallet and withdrawals state)
  // (removed all top-level wallet/withdrawals state/effect)
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingCategories: Array<{ name: string; count: number; color: string }>;
  monthlyRevenue: number[];
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface SecurityOverview {
  securityLevel: string;
  biometricEnabled: boolean;
  lastSecurityCheck: string;
  threatCount: number;
}

interface SyncOverview {
  pendingActions: number;
  lastSyncTime: string;
  isOnline: boolean;
  syncErrors: number;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { myProducts } = useSelector((state: RootState) => state.products);
  const { statistics } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topSellingCategories: [],
    monthlyRevenue: [0, 0, 0, 0, 0, 0],
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  const [securityOverview, setSecurityOverview] = useState<SecurityOverview>({
    securityLevel: 'MEDIUM',
    biometricEnabled: false,
    lastSecurityCheck: 'Jamais',
    threatCount: 0,
  });

  const [syncOverview, setSyncOverview] = useState<SyncOverview>({
    pendingActions: 0,
    lastSyncTime: 'Jamais',
    isOnline: false,
    syncErrors: 0,
  });

  // Wallet and withdrawals state (fix hook location)
  const [wallet, setWallet] = useState<Wallet | null>(null);
  // const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]); // No longer used

  useEffect(() => {
    loadWalletData();
  }, [loadDashboardData]);

  const loadWalletData = async () => {
    try {
      const walletData = await walletService.getWallet();
      setWallet(walletData);
      const withdrawalList = await walletService.getWithdrawals();
      setWithdrawals(withdrawalList);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadSecurityOverview();
    loadSyncOverview();
    
    // Set up sync listener
    syncService.addSyncListener(handleSyncStatusChange);
    
    return () => {
      syncService.removeSyncListener(handleSyncStatusChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load products and orders
      dispatch(getMyProducts({ page: 1, limit: 100 }));
      dispatch(getMySales({ page: 1, limit: 100 }));
      dispatch(getOrderStatistics());

      // Load analytics from offline database
      await loadAnalyticsData();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // Use backend statistics and product state for analytics
      const totalRevenue = statistics?.total_revenue || 0;
      const totalOrders = statistics?.total_orders || 0;
      const totalProducts = myProducts.length;
      // Only use fields that exist in backend statistics
      const pendingOrders = statistics?.pending_orders || 0;
      const completedOrders = statistics?.completed_orders || 0;
      // No cancelledOrders, conversionRate, topSellingCategories, monthlyRevenue, averageOrderValue in backend

      setAnalyticsData({
        const styles = StyleSheet.create({
          container: {
            flex: 1,
            backgroundColor: '#F5F5F5',
          },
          overviewContainer: {
            backgroundColor: '#fff',
            margin: 12,
            padding: 16,
            borderRadius: 12,
            elevation: 2,
          },
          sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
            color: '#333',
          },
          overviewCard: {
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
            elevation: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          revenueCard: {
            borderLeftWidth: 5,
            borderLeftColor: '#2196F3',
          },
          walletCardMargin: {
            marginTop: 12,
          },
          walletLink: {
            color: '#2196F3',
            marginTop: 8,
          },
          breakdownItemGreen: {
            backgroundColor: '#E8F5E8',
          },
          breakdownItemBlue: {
            backgroundColor: '#E3F2FD',
          },
          breakdownItemRed: {
            backgroundColor: '#FFEBEE',
          },
          overviewCardTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
          },
          overviewCardValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#2196F3',
          },
          walletBalance: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#388E3C',
            marginTop: 8,
          },
          breakdownContainer: {
            marginTop: 16,
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 12,
            elevation: 1,
          },
          breakdownTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 8,
          },
          breakdownItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            borderRadius: 8,
            marginBottom: 8,
          },
          breakdownLabel: {
            fontSize: 15,
            color: '#333',
          },
          breakdownValue: {
            fontSize: 15,
            fontWeight: 'bold',
            color: '#2196F3',
          },
          statusContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
          },
          statusCard: {
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 12,
            marginHorizontal: 4,
            alignItems: 'center',
            elevation: 1,
          },
          statusTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333',
          },
          statusValue: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#2196F3',
            marginTop: 4,
          },
          statusSubtext: {
            fontSize: 12,
            color: '#888',
            marginTop: 2,
          },
        });
        { text: 'Configurer', onPress: () => {
          // Navigate to security settings
        }}
      ]
    );
  };

  const renderOverviewCards = () => {
    if (!user) {
      // Visitor: show only basic stats
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Vue d'ensemble (Visiteur)</Text>
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.productsCard]}>
              <Icon name="inventory" size={24} color="#FF9800" />
              <Text style={styles.cardValue}>{analyticsData.totalProducts}</Text>
              <Text style={styles.cardLabel}>Produits</Text>
            </View>
          </View>
        </View>
      );
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      // Enhanced Admin Dashboard: show users, revenue, orders, growth, and recent activity
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Dashboard Administrateur</Text>
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.revenueCard]}>
              <Icon name="attach-money" size={24} color="#4CAF50" />
              <Text style={styles.cardValue}>{analyticsData.totalRevenue.toLocaleString()} XAF</Text>
              <Text style={styles.cardLabel}>Revenus totaux</Text>
            </View>
            <View style={[styles.overviewCard, styles.ordersCard]}>
              <Icon name="shopping-bag" size={24} color="#2196F3" />
              <Text style={styles.cardValue}>{analyticsData.totalOrders}</Text>
              <Text style={styles.cardLabel}>Commandes</Text>
            </View>
          </View>
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.productsCard]}>
              <Icon name="inventory" size={24} color="#FF9800" />
              <Text style={styles.cardValue}>{analyticsData.totalProducts}</Text>
              <Text style={styles.cardLabel}>Produits</Text>
            </View>
            <View style={[styles.overviewCard, styles.usersCard]}>
              <Icon name="people" size={24} color="#1976D2" />
              <Text style={styles.cardValue}>{statistics?.total_users || 0}</Text>
              <Text style={styles.cardLabel}>Utilisateurs</Text>
            </View>
          </View>
          {/* Growth/Trends */}
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.growthCard]}>
              <Icon name="trending-up" size={24} color="#388E3C" />
              <Text style={styles.cardValue}>{statistics?.user_growth_rate ? statistics.user_growth_rate + '%' : '+0%'}</Text>
              <Text style={styles.cardLabel}>Croissance utilisateurs</Text>
            </View>
            <View style={[styles.overviewCard, styles.growthCard]}>
              <Icon name="trending-up" size={24} color="#388E3C" />
              <Text style={styles.cardValue}>{statistics?.revenue_growth_rate ? statistics.revenue_growth_rate + '%' : '+0%'}</Text>
              <Text style={styles.cardLabel}>Croissance revenus</Text>
            </View>
          </View>
          {wallet && (
            <TouchableOpacity
              style={[styles.overviewCard, styles.revenueCard, styles.walletCardMargin]}
              onPress={() => navigation.navigate('Wallet' as never)}
            >
              <Text style={styles.cardLabel}>Solde du portefeuille</Text>
              <Text style={styles.cardValue}>{wallet.balance.toLocaleString()} {wallet.currency}</Text>
              <Text style={styles.walletLink}>Voir le portefeuille</Text>
            </TouchableOpacity>
          )}
          {/* Recent Activity Section */}
          <View style={styles.recentActivityContainer}>
            <Text style={styles.sectionTitle}>Activité récente</Text>
            {statistics?.recent_orders && statistics.recent_orders.length > 0 ? (
              statistics.recent_orders.slice(0, 3).map((order: any) => (
                <View key={order.id} style={styles.recentOrderItem}>
                  <Icon name="shopping-bag" size={18} color="#2196F3" />
                  <Text style={styles.recentOrderText}>Commande #{order.id} - {order.status} - {order.total} XAF</Text>
                </View>
              ))
            ) : (
              <Text style={styles.cardLabel}>Aucune commande récente</Text>
            )}
          </View>
        </View>
      );
    }
  usersCard: {
    backgroundColor: '#E3F2FD',
  },
  growthCard: {
    backgroundColor: '#E8F5E8',
  },
  recentActivityContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 1,
  },
  recentOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentOrderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },

    if (user.role === 'seller') {
      // Seller: show sales, withdrawals, products
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Dashboard Vendeur</Text>
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.revenueCard]}>
              <Icon name="attach-money" size={24} color="#4CAF50" />
              <Text style={styles.cardValue}>{analyticsData.totalRevenue.toLocaleString()} XAF</Text>
              <Text style={styles.cardLabel}>Ventes totales</Text>
            </View>
            <View style={[styles.overviewCard, styles.ordersCard]}>
              <Icon name="shopping-bag" size={24} color="#2196F3" />
              <Text style={styles.cardValue}>{analyticsData.totalOrders}</Text>
              <Text style={styles.cardLabel}>Commandes reçues</Text>
            </View>
          </View>
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.productsCard]}>
              <Icon name="inventory" size={24} color="#FF9800" />
              <Text style={styles.cardValue}>{analyticsData.totalProducts}</Text>
              <Text style={styles.cardLabel}>Produits en vente</Text>
            </View>
            {wallet && (
              <TouchableOpacity
                style={[styles.overviewCard, styles.revenueCard]}
                onPress={() => navigation.navigate('Wallet' as never)}
              >
                <Text style={styles.cardLabel}>Solde du portefeuille</Text>
                <Text style={styles.cardValue}>{wallet.balance.toLocaleString()} {wallet.currency}</Text>
                <Text style={styles.walletLink}>Voir le portefeuille</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    if (user.role === 'client') {
      // Enhanced Client Dashboard: quick stats, recent orders, recommendations
      // Mocked values for wishlist, loyalty, saved cards (replace with real data if available)
      const wishlistCount = statistics?.wishlist_count || 0;
      const loyaltyPoints = statistics?.loyalty_points || 0;
      const savedCards = statistics?.saved_cards || 0;
      const recentOrders = statistics?.recent_orders || [];
      const recommendations = statistics?.recommendations || [];
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Dashboard Client</Text>
          {/* Quick Stats */}
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.ordersCard]}>
              <Icon name="shopping-bag" size={24} color="#2196F3" />
              <Text style={styles.cardValue}>{analyticsData.totalOrders}</Text>
              <Text style={styles.cardLabel}>Commandes</Text>
            </View>
            <View style={[styles.overviewCard, styles.wishlistCard]}>
              <Icon name="favorite" size={24} color="#E53935" />
              <Text style={styles.cardValue}>{wishlistCount}</Text>
              <Text style={styles.cardLabel}>Favoris</Text>
            </View>
          </View>
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.loyaltyCard]}>
              <Icon name="card-giftcard" size={24} color="#FBC02D" />
              <Text style={styles.cardValue}>{loyaltyPoints}</Text>
              <Text style={styles.cardLabel}>Points fidélité</Text>
            </View>
            <View style={[styles.overviewCard, styles.cardsCard]}>
              <Icon name="credit-card" size={24} color="#388E3C" />
              <Text style={styles.cardValue}>{savedCards}</Text>
              <Text style={styles.cardLabel}>Cartes enregistrées</Text>
            </View>
          </View>
          {wallet && (
            <TouchableOpacity
              style={[styles.overviewCard, styles.revenueCard, styles.walletCardMargin]}
              onPress={() => navigation.navigate('Wallet' as never)}
            >
              <Text style={styles.cardLabel}>Solde du portefeuille</Text>
              <Text style={styles.cardValue}>{wallet.balance.toLocaleString()} {wallet.currency}</Text>
              <Text style={styles.walletLink}>Voir le portefeuille</Text>
            </TouchableOpacity>
          )}
          {/* Recent Orders */}
          <View style={styles.recentActivityContainer}>
            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 3).map((order: any) => (
                <View key={order.id} style={styles.recentOrderItem}>
                  <Icon name="shopping-bag" size={18} color="#2196F3" />
                  <Text style={styles.recentOrderText}>Commande #{order.id} - {order.status} - {order.total} XAF</Text>
                </View>
              ))
            ) : (
              <Text style={styles.cardLabel}>Aucune commande récente</Text>
            )}
          </View>
          {/* Recommendations */}
          <View style={styles.recentActivityContainer}>
            <Text style={styles.sectionTitle}>Recommandé pour vous</Text>
            {recommendations.length > 0 ? (
              recommendations.slice(0, 3).map((product: any) => (
                <View key={product.id} style={styles.recentOrderItem}>
                  <Icon name="star" size={18} color="#FFD600" />
                  <Text style={styles.recentOrderText}>{product.name} - {product.price} XAF</Text>
                </View>
              ))
            ) : (
              <Text style={styles.cardLabel}>Aucune recommandation</Text>
            )}
          </View>
        </View>
      );
    }
  wishlistCard: {
    backgroundColor: '#FFEBEE',
  },
  loyaltyCard: {
    backgroundColor: '#FFFDE7',
  },
  cardsCard: {
    backgroundColor: '#E8F5E9',
  },

    if (user.role === 'delivery') {
      // Delivery: show delivery stats
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Dashboard Livreur</Text>
          <View style={styles.cardsRow}>
            <View style={[styles.overviewCard, styles.ordersCard]}>
              <Icon name="local-shipping" size={24} color="#2196F3" />
              <Text style={styles.cardValue}>{analyticsData.totalOrders}</Text>
              <Text style={styles.cardLabel}>Livraisons</Text>
            </View>
          </View>
        </View>
      );
    }

    // Default fallback
    return null;
  };

  const renderRevenueChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Évolution des revenus (6 derniers mois)</Text>
      <LineChart
        data={{
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          datasets: [{
            data: analyticsData.monthlyRevenue,
            strokeWidth: 2,
          }],
        }}
        width={width - 40}
        height={200}
        yAxisLabel=""
        yAxisSuffix="k"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#2E7D32',
          },
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderCategoriesChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Ventes par catégorie</Text>
      <PieChart
        data={analyticsData.topSellingCategories}
        width={width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />
    </View>
  );

  const renderOrdersBreakdown = () => (
    <View style={styles.breakdownContainer}>
      <Text style={styles.sectionTitle}>Répartition des commandes</Text>
      <View style={styles.breakdownRow}>
  <View style={[styles.breakdownItem, styles.breakdownItemGreen]}>  
          <Icon name="hourglass-empty" size={20} color="#4CAF50" />
          <Text style={styles.breakdownValue}>{analyticsData.pendingOrders}</Text>
          <Text style={styles.breakdownLabel}>En attente</Text>
        </View>
        
  <View style={[styles.breakdownItem, styles.breakdownItemBlue]}>  
          <Icon name="check-circle" size={20} color="#2196F3" />
          <Text style={styles.breakdownValue}>{analyticsData.completedOrders}</Text>
          <Text style={styles.breakdownLabel}>Terminées</Text>
        </View>
        
  <View style={[styles.breakdownItem, styles.breakdownItemRed]}>  
          <Icon name="cancel" size={20} color="#F44336" />
          <Text style={styles.breakdownValue}>{analyticsData.cancelledOrders}</Text>
          <Text style={styles.breakdownLabel}>Annulées</Text>
        </View>
      </View>
    </View>
  );

  const renderSystemStatus = () => (
    <View style={styles.systemContainer}>
      <Text style={styles.sectionTitle}>État du système</Text>
      
      {/* Security Status */}
      <TouchableOpacity 
        style={styles.statusCard}
        onPress={handleSecuritySettings}
      >
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <Icon name="shield" size={24} color={
              securityOverview.securityLevel === 'HIGH' ? '#4CAF50' :
              securityOverview.securityLevel === 'MEDIUM' ? '#FF9800' : '#F44336'
            } />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Sécurité</Text>
            <Text style={styles.statusValue}>
              Niveau: {securityOverview.securityLevel}
            </Text>
            <Text style={styles.statusSubtext}>
              Biométrie: {securityOverview.biometricEnabled ? 'Activée' : 'Désactivée'}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Sync Status */}
      <TouchableOpacity 
        style={styles.statusCard}
        onPress={handleForcSync}
      >
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <Icon 
              name={syncOverview.isOnline ? 'cloud-done' : 'cloud-off'} 
              size={24} 
              color={syncOverview.isOnline ? '#4CAF50' : '#F44336'} 
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Synchronisation</Text>
            <Text style={styles.statusValue}>
              {syncOverview.isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
            <Text style={styles.statusSubtext}>
              {syncOverview.pendingActions > 0 
                ? `${syncOverview.pendingActions} actions en attente`
                : 'Tout synchronisé'
              }
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderOverviewCards()}
      {renderRevenueChart()}
      {renderCategoriesChart()}
      {renderOrdersBreakdown()}
      {renderSystemStatus()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  walletCardMargin: {
    marginTop: 12,
  },
  walletLink: {
    color: '#2196F3',
    marginTop: 8,
  },
  breakdownItemGreen: {
    backgroundColor: '#E8F5E8',
  },
  breakdownItemBlue: {
    backgroundColor: '#E3F2FD',
  },
  breakdownItemRed: {
    backgroundColor: '#FFEBEE',
  },
// Local styles for DashboardScreen (not shared)
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  overviewContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
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
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overviewCard: {
  wishlistCard: {
    backgroundColor: '#FFEBEE',
  },
  loyaltyCard: {
    backgroundColor: '#FFFDE7',
  },
  cardsCard: {
    backgroundColor: '#E8F5E9',
  },
    flex: 0.48,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  usersCard: {
    backgroundColor: '#E3F2FD',
  },
  growthCard: {
    backgroundColor: '#E8F5E8',
  },
  recentActivityContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 1,
  },
  recentOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentOrderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  revenueCard: {
    backgroundColor: '#E8F5E8',
  },
  ordersCard: {
    backgroundColor: '#E3F2FD',
  },
  productsCard: {
    backgroundColor: '#FFF3E0',
  },
  conversionCard: {
    backgroundColor: '#F3E5F5',
  },
  wishlistCard: {
    backgroundColor: '#FFEBEE',
  },
  loyaltyCard: {
    backgroundColor: '#FFFDE7',
  },
  cardsCard: {
    backgroundColor: '#E8F5E9',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
  breakdownContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flex: 0.3,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  systemContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 32,
  },
  statusCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

export default DashboardScreen;