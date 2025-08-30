import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { getMyOrders, getMySales, getOrderStatistics } from '../../store/slices/orderSlice';
import { Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Order, OrderStatus } from '../../models';

type TabType = 'orders' | 'sales';

const OrdersListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { orders, sales, isLoading, statistics, pagination } = useSelector((state: RootState) => state.orders);

  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async (page = 1) => {
    try {
      if (activeTab === 'orders') {
        await dispatch(getMyOrders({ page, limit: 20 })).unwrap();
      } else {
        await dispatch(getMySales({ page, limit: 20 })).unwrap();
      }

      if (page === 1) {
        dispatch(getOrderStatistics());
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Erreur lors du chargement');
    }
  }, [activeTab, dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadData(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && currentPage < pagination.total_pages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadData(nextPage);
    }
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetails' as any, { orderId: order.id });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
      case 'draft':
        return colors.warning;
      case 'paid':
      case 'confirmed':
      case 'preparing':
        return colors.info;
      case 'ready_for_pickup':
      case 'shipped':
      case 'in_transit':
        return colors.primary;
      case 'delivered':
      case 'completed':
        return colors.success;
      case 'cancelled':
      case 'refunded':
        return colors.error;
      case 'disputed':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      draft: 'Brouillon',
      pending_payment: 'Paiement en attente',
      paid: 'Payé',
      confirmed: 'Confirmé',
      preparing: 'En préparation',
      ready_for_pickup: 'Prêt à récupérer',
      shipped: 'Expédié',
      in_transit: 'En transit',
      delivered: 'Livré',
      completed: 'Terminé',
      cancelled: 'Annulé',
      refunded: 'Remboursé',
      disputed: 'Contesté',
    };
    return labels[status] || status;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{item.order_number}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.orderContent}>
          <View style={styles.orderDetails}>
            <Text style={styles.totalAmount}>{formatPrice(item.total_amount)}</Text>
            <Text style={styles.itemCount}>
              {item.items?.length || 0} article{item.items?.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.orderMeta}>
            {activeTab === 'orders' ? (
              <Text style={styles.metaText}>Vendeur: ID {item.seller_id}</Text>
            ) : (
              <Text style={styles.metaText}>Acheteur: ID {item.buyer_id}</Text>
            )}
            <Text style={styles.metaText}>
              {item.delivery_method === 'pickup' ? 'Retrait' :
               item.delivery_method === 'delivery' ? 'Livraison' : 'Expédition'}
            </Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chat" size={16} color={colors.primary} />
            <Text style={styles.actionText}>Contacter</Text>
          </TouchableOpacity>

          {item.status === 'ready_for_pickup' && (
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="location-on" size={16} color={colors.primary} />
              <Text style={styles.actionText}>Localiser</Text>
            </TouchableOpacity>
          )}

          {item.tracking_number && (
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="local-shipping" size={16} color={colors.primary} />
              <Text style={styles.actionText}>Suivre</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View style={styles.statisticsContainer}>
        <Card style={styles.statisticsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {activeTab === 'orders' ? statistics.total_orders : statistics.total_sales}
              </Text>
              <Text style={styles.statLabel}>
                {activeTab === 'orders' ? 'Commandes' : 'Ventes'}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {activeTab === 'orders' ? statistics.pending_orders : statistics.pending_orders}
              </Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {activeTab === 'orders' ? statistics.completed_orders : statistics.completed_orders}
              </Text>
              <Text style={styles.statLabel}>Terminées</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatPrice(activeTab === 'orders' ? statistics.total_spent : statistics.total_revenue)}
              </Text>
              <Text style={styles.statLabel}>
                {activeTab === 'orders' ? 'Dépensé' : 'Revenus'}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shopping-cart" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'orders' ? 'Aucune commande' : 'Aucune vente'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'orders'
          ? 'Vous n\'avez pas encore passé de commande'
          : 'Vous n\'avez pas encore de vente'
        }
      </Text>
      {activeTab === 'orders' && (
        <Button
          title="Commencer les achats"
          onPress={() => navigation.navigate('Home' as any)}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  const currentData = activeTab === 'orders' ? orders : sales;

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Mes commandes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sales' && styles.activeTab]}
          onPress={() => setActiveTab('sales')}
        >
          <Text style={[styles.tabText, activeTab === 'sales' && styles.activeTabText]}>
            Mes ventes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      {renderStatistics()}

      {/* Orders List */}
      <FlatList
        data={currentData}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={
          isLoading && currentData.length > 0 ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : null
        }
      />

      {isLoading && currentData.length === 0 && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.white,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  statisticsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statisticsCard: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  orderItem: {
    marginBottom: spacing.md,
  },
  orderCard: {
    padding: spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  orderDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '500',
  },
  orderContent: {
    marginBottom: spacing.md,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  itemCount: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  orderMeta: {
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFooter: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
});

export default OrdersListScreen;
