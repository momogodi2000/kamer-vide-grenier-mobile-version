import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  getFeaturedProducts,
  getRecentProducts,
  getCategories,
} from '../../store/slices/productSlice';
import { getCartItemCount } from '../../store/slices/cartSlice';
import { getUnreadCount } from '../../store/slices/notificationSlice';
import { 
  securityService, 
  syncService, 
  offlineDatabase,
  biometricService 
} from '../../services';
import { Product, Category, User } from '../../models';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

interface DashboardStats {
  totalProducts: number;
  activeOrders: number;
  unreadNotifications: number;
  cartItems: number;
  pendingSyncActions: number;
  securityLevel: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { featuredProducts, recentProducts, categories, isLoading } = useSelector(
    (state: RootState) => state.products
  );
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeOrders: 0,
    unreadNotifications: 0,
    cartItems: 0,
    pendingSyncActions: 0,
    securityLevel: 'MEDIUM',
  });
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    initializeHome();
    setupSyncListener();
    checkBiometricStatus();
    
    return () => {
      syncService.removeSyncListener(handleSyncStatusChange);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, dispatch]);

  const initializeHome = async () => {
    try {
      // Initialize services if not already done
      await securityService.initialize();
      await syncService.initialize();
      
      // Load cached data for offline experience
      await loadCachedData();
      
      // Load dashboard stats
      await loadDashboardStats();
    } catch (error) {
      console.error('Failed to initialize home screen:', error);
    }
  };

  const setupSyncListener = () => {
    syncService.addSyncListener(handleSyncStatusChange);
  };

  const handleSyncStatusChange = (status: any) => {
    setSyncStatus(status);
  };

  const checkBiometricStatus = async () => {
    try {
      const enabled = await biometricService.isBiometricEnabled();
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Failed to check biometric status:', error);
    }
  };

  const loadDashboardData = () => {
    dispatch(getFeaturedProducts());
    dispatch(getRecentProducts(20));
    dispatch(getCategories());
    dispatch(getCartItemCount());
    dispatch(getUnreadCount());
  };

  const loadCachedData = async () => {
    try {
      // Load cached products for offline experience
      const cachedFeatured = await offlineDatabase.getCachedProducts({ 
        is_featured: true, 
        limit: 10 
      });
      
      const cachedRecent = await offlineDatabase.getCachedProducts({ 
        limit: 20 
      });

      // Update store with cached data if no fresh data is available
      if (cachedFeatured.length > 0 && featuredProducts.length === 0) {
        // You could dispatch to update the store with cached data
        console.log('Loaded cached featured products:', cachedFeatured.length);
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const stats = await offlineDatabase.getDatabaseStats();
      const securityProfile = securityService.getSecurityProfile();
      const syncStats = await syncService.getSyncStatistics();

      setDashboardStats({
        totalProducts: stats.cachedProducts,
        activeOrders: 0, // Would be loaded from orders
        unreadNotifications: unreadCount,
        cartItems: itemCount,
        pendingSyncActions: syncStats.pendingActions,
        securityLevel: securityProfile?.securityLevel || 'MEDIUM',
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (syncStatus?.isOnline) {
        // Force refresh data from server
        await syncService.forceRefreshData();
        loadDashboardData();
      }
      await loadDashboardStats();
    } catch (error) {
      console.error('Refresh failed:', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir les données');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSecurityCheck = async () => {
    try {
      const profile = securityService.getSecurityProfile();
      if (profile) {
        const message = `
Niveau de sécurité: ${profile.securityLevel}
Appareil: ${profile.deviceModel}
Authentification biométrique: ${biometricEnabled ? 'Activée' : 'Désactivée'}
Actions en attente de synchronisation: ${dashboardStats.pendingSyncActions}
        `;
        
        Alert.alert('État de sécurité', message, [
          { text: 'OK' },
          { text: 'Paramètres', onPress: () => navigation.navigate('ProfileTab' as never) }
        ]);
      }
    } catch (error) {
      console.error('Security check failed:', error);
    }
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <View style={styles.welcomeHeader}>
        <View>
          <Text style={styles.welcomeText}>
            Bonjour{user?.first_name ? `, ${user.first_name}` : ''}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            {syncStatus?.isOnline ? 'En ligne' : 'Mode hors ligne'}
            {dashboardStats.pendingSyncActions > 0 && 
              ` • ${dashboardStats.pendingSyncActions} actions en attente`
            }
          </Text>
        </View>
        <TouchableOpacity onPress={handleSecurityCheck} style={styles.securityIndicator}>
          <Icon 
            name={biometricEnabled ? 'fingerprint' : 'security'} 
            size={24} 
            color={biometricEnabled ? '#4CAF50' : '#FF9800'} 
          />
        </TouchableOpacity>
      </View>

      {syncStatus?.isSyncing && (
        <View style={styles.syncIndicator}>
          <Icon name="sync" size={16} color="#2196F3" />
          <Text style={styles.syncText}>
            Synchronisation... {syncStatus.syncProgress}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.sectionTitle}>Tableau de bord</Text>
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard}>
          <Icon name="store" size={24} color="#2E7D32" />
          <Text style={styles.statNumber}>{dashboardStats.totalProducts}</Text>
          <Text style={styles.statLabel}>Produits</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard}>
          <Icon name="shopping-cart" size={24} color="#1976D2" />
          <Text style={styles.statNumber}>{dashboardStats.cartItems}</Text>
          <Text style={styles.statLabel}>Panier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard}>
          <Icon name="notifications" size={24} color="#F57C00" />
          <Text style={styles.statNumber}>{dashboardStats.unreadNotifications}</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statCard} onPress={handleSecurityCheck}>
          <Icon 
            name="shield" 
            size={24} 
            color={dashboardStats.securityLevel === 'HIGH' ? '#4CAF50' : 
                   dashboardStats.securityLevel === 'MEDIUM' ? '#FF9800' : '#F44336'} 
          />
          <Text style={styles.statNumber}>{dashboardStats.securityLevel}</Text>
          <Text style={styles.statLabel}>Sécurité</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Search')}
        >
          <Icon name="search" size={32} color="#2E7D32" />
          <Text style={styles.actionLabel}>Rechercher</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('SellTab')}
        >
          <Icon name="add-circle" size={32} color="#1976D2" />
          <Text style={styles.actionLabel}>Vendre</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('OrdersTab')}
        >
          <Icon name="receipt" size={32} color="#F57C00" />
          <Text style={styles.actionLabel}>Commandes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => syncService.syncNow()}
        >
          <Icon name="sync" size={32} color="#9C27B0" />
          <Text style={styles.actionLabel}>Synchroniser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeaturedProducts = () => {
    if (!featuredProducts.length && !isLoading) {
      return null;
    }

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produits mis en avant</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ProductList', { 
              title: 'Produits mis en avant', 
              featured: true 
            })}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={featuredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            >
              <Image
                source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.productPrice}>
                  {item.price.toLocaleString()} {item.currency}
                </Text>
                <Text style={styles.productLocation}>
                  {item.city}, {item.region}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.productsListContainer}
        />
      </View>
    );
  };

  const renderCategories = () => {
    if (!categories.length) {
      return null;
    }

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <FlatList
          data={categories.slice(0, 8)} // Show first 8 categories
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigation.navigate('CategoryProducts', { 
                categoryId: item.id, 
                categoryName: item.name 
              })}
            >
              <Icon name="category" size={32} color="#2E7D32" />
              <Text style={styles.categoryName} numberOfLines={2}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesListContainer}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderWelcomeSection()}
      {renderQuickStats()}
      {renderQuickActions()}
      {renderFeaturedProducts()}
      {renderCategories()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#E8F5E8',
  },
  securityIndicator: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  syncText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 8,
  },
  quickStatsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    alignItems: 'center',
    flex: 1,
    padding: 16,
  },
  actionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  productsListContainer: {
    paddingRight: 16,
  },
  productCard: {
    width: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 12,
    color: '#666',
  },
  categoriesListContainer: {
    paddingRight: 16,
  },
  categoryCard: {
    width: 80,
    height: 80,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  categoryName: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default HomeScreen;