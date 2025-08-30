import React, { useEffect, useState, useCallback } from 'react';
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
import { getOrderStatistics } from '../../store/slices/orderSlice';
import { walletService } from '../../services/walletService';
import { Wallet } from '../../types/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
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
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadWalletData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load products and statistics
      await dispatch(getMyProducts({ page: 1, limit: 20 }));
      await dispatch(getOrderStatistics());

      // Calculate analytics from loaded data
      const totalRevenue = statistics?.total_revenue || 0;
      const totalOrders = statistics?.total_orders || 0;
      const totalProducts = myProducts.length;
      const pendingOrders = statistics?.pending_orders || 0;
      const completedOrders = statistics?.completed_orders || 0;

      setAnalyticsData({
        totalRevenue,
        totalOrders,
        totalProducts,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        pendingOrders,
        completedOrders,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadWalletData = useCallback(async () => {
    try {
      if (user) {
        const walletData = await walletService.getWallet();
        if (walletData.success && walletData.data) {
          setWallet(walletData.data);
        }
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    await loadWalletData();
    setRefreshing(false);
  };

  const handleSecurityAction = () => {
    Alert.alert(
      'Sécurité',
      'Actions de sécurité disponibles',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Configurer',
          onPress: () => {
            // Navigate to security settings
          }
        }
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
      // Admin Dashboard
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Tableau de Bord Admin</Text>
          <View style={styles.cardsGrid}>
            <View style={[styles.overviewCard, styles.revenueCard]}>
              <Icon name="attach-money" size={24} color="#4CAF50" />
              <Text style={styles.cardValue}>{analyticsData.totalRevenue.toLocaleString()} XAF</Text>
              <Text style={styles.cardLabel}>Revenus Totaux</Text>
            </View>
            <View style={[styles.overviewCard, styles.ordersCard]}>
              <Icon name="shopping-cart" size={24} color="#2196F3" />
              <Text style={styles.cardValue}>{analyticsData.totalOrders}</Text>
              <Text style={styles.cardLabel}>Commandes</Text>
            </View>
            <View style={[styles.overviewCard, styles.usersCard]}>
              <Icon name="people" size={24} color="#9C27B0" />
              <Text style={styles.cardValue}>{analyticsData.totalProducts}</Text>
              <Text style={styles.cardLabel}>Utilisateurs</Text>
            </View>
            <View style={[styles.overviewCard, styles.productsCard]}>
              <Icon name="inventory" size={24} color="#FF9800" />
              <Text style={styles.cardValue}>{analyticsData.totalProducts}</Text>
              <Text style={styles.cardLabel}>Produits</Text>
            </View>
          </View>
        </View>
      );
    }

    if (user.role === 'client') {
      // Client Dashboard
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Mon Tableau de Bord</Text>
          <View style={styles.cardsGrid}>
            <View style={[styles.overviewCard, styles.revenueCard]}>
              <Icon name="attach-money" size={24} color="#4CAF50" />
              <Text style={styles.cardValue}>{analyticsData.totalRevenue.toLocaleString()} XAF</Text>
              <Text style={styles.cardLabel}>Revenus</Text>
            </View>
            <View style={[styles.overviewCard, styles.ordersCard]}>
              <Icon name="shopping-cart" size={24} color="#2196F3" />
              <Text style={styles.cardValue}>{analyticsData.totalOrders}</Text>
              <Text style={styles.cardLabel}>Commandes</Text>
            </View>
            <View style={[styles.overviewCard, styles.productsCard]}>
              <Icon name="inventory" size={24} color="#FF9800" />
              <Text style={styles.cardValue}>{analyticsData.totalProducts}</Text>
              <Text style={styles.cardLabel}>Mes Produits</Text>
            </View>
            {wallet && (
              <View style={[styles.overviewCard, styles.walletCard]}>
                <Icon name="account-balance-wallet" size={24} color="#FF5722" />
                <Text style={styles.cardValue}>{wallet.balance.toLocaleString()} XAF</Text>
                <Text style={styles.cardLabel}>Portefeuille</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (user.role === 'delivery') {
      // Delivery Agent Dashboard
      return (
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Dashboard Livreur</Text>
          <View style={styles.cardsGrid}>
            <View style={[styles.overviewCard, styles.deliveriesCard]}>
              <Icon name="local-shipping" size={24} color="#4CAF50" />
              <Text style={styles.cardValue}>{analyticsData.completedOrders}</Text>
              <Text style={styles.cardLabel}>Livraisons</Text>
            </View>
            <View style={[styles.overviewCard, styles.pendingCard]}>
              <Icon name="schedule" size={24} color="#FF9800" />
              <Text style={styles.cardValue}>{analyticsData.pendingOrders}</Text>
              <Text style={styles.cardLabel}>En Attente</Text>
            </View>
            {wallet && (
              <View style={[styles.overviewCard, styles.walletCard]}>
                <Icon name="account-balance-wallet" size={24} color="#FF5722" />
                <Text style={styles.cardValue}>{wallet.balance.toLocaleString()} XAF</Text>
                <Text style={styles.cardLabel}>Gains</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user ? `Bonjour, ${user.first_name}!` : 'Bienvenue'}
        </Text>
        <TouchableOpacity onPress={handleSecurityAction} style={styles.securityButton}>
          <Icon name="security" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {renderOverviewCards()}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        <View style={styles.quickActionsGrid}>
          {user?.role === 'client' && (
            <>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('CreateProduct' as never)}
              >
                <Icon name="add" size={24} color="#4CAF50" />
                <Text style={styles.quickActionText}>Vendre</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('MyProducts' as never)}
              >
                <Icon name="inventory" size={24} color="#2196F3" />
                <Text style={styles.quickActionText}>Mes Produits</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Wallet' as never)}
          >
            <Icon name="account-balance-wallet" size={24} color="#FF5722" />
            <Text style={styles.quickActionText}>Portefeuille</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Orders' as never)}
          >
            <Icon name="shopping-cart" size={24} color="#9C27B0" />
            <Text style={styles.quickActionText}>Commandes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  securityButton: {
    padding: 8,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 1,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: width * 0.42,
    maxWidth: width * 0.45,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  usersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  productsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  walletCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  deliveriesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    minWidth: width * 0.42,
    maxWidth: width * 0.45,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;