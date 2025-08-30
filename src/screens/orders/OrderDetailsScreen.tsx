import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { getOrderById, updateOrderStatus } from '../../store/slices/orderSlice';
import { Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { OrderStatus } from '../../models';
import { OrderItem } from '../../models/Order';

type OrderDetailsRouteProp = RouteProp<{ OrderDetails: { orderId: string } }, 'OrderDetails'>;

const OrderDetailsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<OrderDetailsRouteProp>();
  const { selectedOrder, isLoading } = useSelector((state: RootState) => state.orders);

  const { orderId } = route.params;

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

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

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    try {
      await dispatch(updateOrderStatus({
        orderId: selectedOrder.id,
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      })).unwrap();

      Alert.alert('Succès', 'Statut de la commande mis à jour');
      // Refresh order data
      dispatch(getOrderById(orderId));
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleContactSeller = () => {
    if (!selectedOrder) return;
    navigation.navigate('OrderChat' as any, { orderId: selectedOrder.id });
  };

  const handleTrackOrder = () => {
    if (!selectedOrder) return;
    navigation.navigate('OrderTracking' as any, { orderId: selectedOrder.id });
  };

  const handleViewProduct = (productId: string) => {
    navigation.navigate('ProductDetails' as any, { productId });
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleViewProduct(item.product_id)}
    >
      <View style={styles.itemImageContainer}>
        {item.product_image ? (
          <Text style={styles.itemImagePlaceholder}>📷</Text>
        ) : (
          <Text style={styles.itemImagePlaceholder}>📦</Text>
        )}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.product_title}
        </Text>
        <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.total_price)}</Text>
      </View>

      <TouchableOpacity style={styles.itemAction}>
        <Icon name="chevron-right" size={24} color={colors.text.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderStatusActions = () => {
    if (!selectedOrder) return null;

    const actions = [];

    // Different actions based on current status and user role
    switch (selectedOrder.status) {
      case 'pending_payment':
        actions.push(
          <Button
            key="pay"
            title="Payer maintenant"
            onPress={() => navigation.navigate('PaymentMethod' as any, { orderId: selectedOrder.id })}
            style={styles.actionButton}
          />
        );
        break;

      case 'paid':
      case 'confirmed':
        if (selectedOrder.delivery_method === 'pickup') {
          actions.push(
            <Button
              key="pickup"
              title="Marquer comme récupéré"
              onPress={() => handleUpdateStatus('completed')}
              style={styles.actionButton}
            />
          );
        }
        break;

      case 'preparing':
        actions.push(
          <Button
            key="ready"
            title="Marquer comme prêt"
            onPress={() => handleUpdateStatus('ready_for_pickup')}
            style={styles.actionButton}
          />
        );
        break;

      case 'ready_for_pickup':
        actions.push(
          <Button
            key="picked_up"
            title="Marquer comme récupéré"
            onPress={() => handleUpdateStatus('completed')}
            style={styles.actionButton}
          />
        );
        break;

      case 'shipped':
        actions.push(
          <Button
            key="delivered"
            title="Marquer comme livré"
            onPress={() => handleUpdateStatus('delivered')}
            style={styles.actionButton}
          />
        );
        break;
    }

    return actions.length > 0 ? (
      <View style={styles.actionsContainer}>
        {actions}
      </View>
    ) : null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de la commande...</Text>
      </View>
    );
  }

  if (!selectedOrder) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Commande non trouvée</Text>
        <Button
          title="Retour"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commande #{selectedOrder.order_number}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleContactSeller} style={styles.headerAction}>
            <Icon name="chat" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          {selectedOrder.tracking_number && (
            <TouchableOpacity onPress={handleTrackOrder} style={styles.headerAction}>
              <Icon name="local-shipping" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Order Status */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Statut de la commande</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(selectedOrder.status)}</Text>
          </View>
        </View>

        <View style={styles.statusDetails}>
          <Text style={styles.statusDate}>
            Créée le {formatDate(selectedOrder.created_at)}
          </Text>
          {selectedOrder.estimated_delivery && (
            <Text style={styles.statusDate}>
              Livraison estimée: {formatDate(selectedOrder.estimated_delivery)}
            </Text>
          )}
        </View>
      </Card>

      {/* Order Items */}
      <Card style={styles.itemsCard}>
        <Text style={styles.sectionTitle}>Articles commandés</Text>
        <FlatList
          data={selectedOrder.items || []}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          style={styles.itemsList}
        />
      </Card>

      {/* Order Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Récapitulatif</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>{formatPrice(selectedOrder.subtotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Frais de livraison</Text>
          <Text style={styles.summaryValue}>{formatPrice(selectedOrder.delivery_fee)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Frais de service</Text>
          <Text style={styles.summaryValue}>{formatPrice(selectedOrder.service_fee)}</Text>
        </View>

        {selectedOrder.discount_amount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remise</Text>
            <Text style={styles.summaryValue}>-{formatPrice(selectedOrder.discount_amount)}</Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(selectedOrder.total_amount)}</Text>
        </View>
      </Card>

      {/* Delivery Information */}
      <Card style={styles.deliveryCard}>
        <Text style={styles.sectionTitle}>Informations de livraison</Text>

        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryRow}>
            <Icon name="local-shipping" size={20} color={colors.text.secondary} />
            <Text style={styles.deliveryText}>
              {selectedOrder.delivery_method === 'pickup' ? 'Retrait en magasin' :
               selectedOrder.delivery_method === 'delivery' ? 'Livraison à domicile' :
               selectedOrder.delivery_method === 'shipping' ? 'Expédition' : 'Livraison express'}
            </Text>
          </View>

          {selectedOrder.delivery_address && (
            <View style={styles.deliveryAddress}>
              <Text style={styles.addressTitle}>Adresse de livraison:</Text>
              <Text style={styles.addressText}>
                {selectedOrder.delivery_address.street}
                {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.region}
              </Text>
            </View>
          )}

          {selectedOrder.pickup_location && (
            <View style={styles.deliveryAddress}>
              <Text style={styles.addressTitle}>Point de retrait:</Text>
              <Text style={styles.addressText}>
                {selectedOrder.pickup_location.name}
                {selectedOrder.pickup_location.address}
              </Text>
            </View>
          )}

          {selectedOrder.tracking_number && (
            <View style={styles.deliveryRow}>
              <Icon name="track-changes" size={20} color={colors.text.secondary} />
              <Text style={styles.deliveryText}>
                N° de suivi: {selectedOrder.tracking_number}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Payment Information */}
      <Card style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Informations de paiement</Text>

        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Méthode:</Text>
            <Text style={styles.paymentValue}>
              {selectedOrder.payment_method === 'mobile_money' ? 'Mobile Money' :
               selectedOrder.payment_method === 'bank_transfer' ? 'Virement bancaire' :
               selectedOrder.payment_method === 'cash_on_delivery' ? 'Paiement à la livraison' :
               selectedOrder.payment_method === 'cash' ? 'Espèces' : selectedOrder.payment_method}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Statut:</Text>
            <Text style={styles.paymentValue}>
              {selectedOrder.payment_status === 'paid' ? 'Payé' :
               selectedOrder.payment_status === 'pending' ? 'En attente' :
               selectedOrder.payment_status === 'failed' ? 'Échec' : selectedOrder.payment_status}
            </Text>
          </View>

          {selectedOrder.payment_reference && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Référence:</Text>
              <Text style={styles.paymentValue}>{selectedOrder.payment_reference}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Status Actions */}
      {renderStatusActions()}

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.h1,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  statusCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text.primary,
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
  statusDetails: {
    gap: spacing.xs,
  },
  statusDate: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  itemsCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  itemsList: {
    marginTop: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemImagePlaceholder: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  itemQuantity: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  itemAction: {
    padding: spacing.xs,
  },
  summaryCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body1,
    color: colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  deliveryCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  deliveryInfo: {
    gap: spacing.md,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    ...typography.body1,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  deliveryAddress: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  addressTitle: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  addressText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  paymentCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  paymentInfo: {
    gap: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  paymentValue: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  actionsContainer: {
    margin: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default OrderDetailsScreen;
