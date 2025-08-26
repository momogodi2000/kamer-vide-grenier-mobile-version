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
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getMyProducts } from '../../store/slices/productSlice';
import { getMySales, getOrderStatistics } from '../../store/slices/orderSlice';
import { 
  syncService, 
  offlineDatabase,
  securityService,
  biometricService 
} from '../../services';
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
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myProducts, isLoading: productsLoading } = useSelector(
    (state: RootState) => state.products
  );
  const { sales, statistics, isLoading: ordersLoading } = useSelector(
    (state: RootState) => state.orders
  );

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
      // This would typically come from your backend API
      // For now, we'll generate some sample data
      const sampleData: AnalyticsData = {
        totalRevenue: 275000,
        totalOrders: 45,
        totalProducts: myProducts.length,
        averageOrderValue: 6111,
        conversionRate: 12.5,
        topSellingCategories: [
          { name: 'Électronique', count: 15, color: '#FF6384' },
          { name: 'Vêtements', count: 12, color: '#36A2EB' },
          { name: 'Maison', count: 8, color: '#FFCE56' },
          { name: 'Sport', count: 6, color: '#4BC0C0' },
          { name: 'Livres', count: 4, color: '#FF9F40' },
        ],
        monthlyRevenue: [45000, 52000, 48000, 65000, 58000, 67000],
        pendingOrders: statistics?.pending_orders || 5,
        completedOrders: statistics?.completed_orders || 38,
        cancelledOrders: 2,
      };

      setAnalyticsData(sampleData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadSecurityOverview = async () => {
    try {
      const profile = securityService.getSecurityProfile();
      const biometricEnabled = await biometricService.isBiometricEnabled();
      
      setSecurityOverview({
        securityLevel: profile?.securityLevel || 'MEDIUM',
        biometricEnabled,
        lastSecurityCheck: profile?.lastSecurityCheck 
          ? new Date(profile.lastSecurityCheck).toLocaleDateString('fr-FR')
          : 'Jamais',
        threatCount: profile?.threatDetections.length || 0,
      });
    } catch (error) {
      console.error('Failed to load security overview:', error);
    }
  };

  const loadSyncOverview = async () => {
    try {
      const syncStats = await syncService.getSyncStatistics();
      const syncStatus = syncService.getSyncStatus();
      
      setSyncOverview({
        pendingActions: syncStats.pendingActions,
        lastSyncTime: syncStats.lastSyncTime 
          ? new Date(syncStats.lastSyncTime).toLocaleString('fr-FR')
          : 'Jamais',
        isOnline: syncStatus.isOnline,
        syncErrors: syncStatus.syncErrors.length,
      });
    } catch (error) {
      console.error('Failed to load sync overview:', error);
    }
  };

  const handleSyncStatusChange = (status: any) => {
    setSyncOverview(prev => ({
      ...prev,
      isOnline: status.isOnline,
      syncErrors: status.syncErrors.length,
      pendingActions: status.pendingActions,
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      await loadSecurityOverview();
      await loadSyncOverview();
    } finally {
      setRefreshing(false);
    }
  };

  const handleForcSync = async () => {
    try {
      if (!syncOverview.isOnline) {
        Alert.alert('Hors ligne', 'Impossible de synchroniser sans connexion internet.');
        return;
      }

      Alert.alert(
        'Synchronisation',
        'Voulez-vous forcer la synchronisation de toutes les données ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Synchroniser', 
            onPress: async () => {
              try {
                await syncService.syncNow();
                Alert.alert('Succès', 'Synchronisation terminée avec succès.');
              } catch (error) {
                Alert.alert('Erreur', 'La synchronisation a échoué.');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de lancer la synchronisation.');
    }
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      'Paramètres de sécurité',
      'Voulez-vous configurer vos paramètres de sécurité ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Configurer', onPress: () => {
          // Navigate to security settings
        }}
      ]
    );
  };

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
      <View style={styles.cardsRow}>
        <View style={[styles.overviewCard, styles.revenueCard]}>
          <Icon name="attach-money" size={24} color="#4CAF50" />
          <Text style={styles.cardValue}>
            {analyticsData.totalRevenue.toLocaleString()} XAF
          </Text>
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
        
        <View style={[styles.overviewCard, styles.conversionCard]}>
          <Icon name="trending-up" size={24} color="#9C27B0" />
          <Text style={styles.cardValue}>{analyticsData.conversionRate}%</Text>
          <Text style={styles.cardLabel}>Taux de conversion</Text>
        </View>
      </View>
    </View>
  );

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
        <View style={[styles.breakdownItem, { backgroundColor: '#E8F5E8' }]}>
          <Icon name="hourglass-empty" size={20} color="#4CAF50" />
          <Text style={styles.breakdownValue}>{analyticsData.pendingOrders}</Text>
          <Text style={styles.breakdownLabel}>En attente</Text>
        </View>
        
        <View style={[styles.breakdownItem, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="check-circle" size={20} color="#2196F3" />
          <Text style={styles.breakdownValue}>{analyticsData.completedOrders}</Text>
          <Text style={styles.breakdownLabel}>Terminées</Text>
        </View>
        
        <View style={[styles.breakdownItem, { backgroundColor: '#FFEBEE' }]}>
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
    flex: 0.48,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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