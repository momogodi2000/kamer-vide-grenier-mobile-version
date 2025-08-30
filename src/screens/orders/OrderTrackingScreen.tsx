import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { getOrderById } from '../../store/slices/orderSlice';
import { Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { OrderStatus } from '../../models';

type OrderTrackingRouteProp = RouteProp<{ OrderTracking: { orderId: string } }, 'OrderTracking'>;

const OrderTrackingScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<OrderTrackingRouteProp>();
  const { selectedOrder, isLoading } = useSelector((state: RootState) => state.orders);

  const { orderId } = route.params;

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

  const getStatusSteps = (status: OrderStatus) => {
    const steps = [
      { key: 'confirmed', label: 'Commande confirmée', icon: 'check-circle', completed: false },
      { key: 'preparing', label: 'En préparation', icon: 'shopping-bag', completed: false },
      { key: 'ready_for_pickup', label: 'Prêt à récupérer', icon: 'local-shipping', completed: false },
      { key: 'shipped', label: 'Expédié', icon: 'local-shipping', completed: false },
      { key: 'in_transit', label: 'En transit', icon: 'directions-car', completed: false },
      { key: 'delivered', label: 'Livré', icon: 'check-circle', completed: false },
    ];

    const statusOrder = ['confirmed', 'preparing', 'ready_for_pickup', 'shipped', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
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

  const getStatusColor = (completed: boolean, current: boolean) => {
    if (completed) return colors.success;
    if (current) return colors.primary;
    return colors.text.disabled;
  };

  const getStatusTextColor = (completed: boolean, current: boolean) => {
    if (completed || current) return colors.text.primary;
    return colors.text.disabled;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement du suivi...</Text>
      </View>
    );
  }

  if (!selectedOrder) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Commande non trouvée</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const steps = getStatusSteps(selectedOrder.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de commande</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Card style={styles.orderInfo}>
        <Text style={styles.orderNumber}>Commande #{selectedOrder.order_number}</Text>
        <Text style={styles.orderDate}>
          Commandé le {formatDate(selectedOrder.created_at)}
        </Text>
      </Card>

      <Card style={styles.trackingCard}>
        <Text style={styles.sectionTitle}>Statut de livraison</Text>

        <View style={styles.timeline}>
          {steps.map((step, index) => (
            <View key={step.key} style={styles.stepContainer}>
              <View style={styles.stepLine}>
                {index > 0 && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor: steps[index - 1].completed
                          ? colors.success
                          : colors.border.light,
                      },
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepContent}>
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor: getStatusColor(step.completed, step.current),
                    },
                  ]}
                >
                  <Icon
                    name={step.icon}
                    size={20}
                    color={colors.text.white}
                  />
                </View>

                <View style={styles.stepText}>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: getStatusTextColor(step.completed, step.current),
                        fontWeight: (step.current ? '600' : '400') as any,
                      },
                    ]}
                  >
                    {step.label}
                  </Text>

                  {step.current && selectedOrder?.updated_at && (
                    <Text style={styles.stepDate}>
                      {formatDate(selectedOrder.updated_at)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {selectedOrder.tracking_number && (
        <Card style={styles.trackingInfo}>
          <Text style={styles.sectionTitle}>Informations de suivi</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° de suivi:</Text>
            <Text style={styles.infoValue}>{selectedOrder.tracking_number}</Text>
          </View>

          {selectedOrder.delivery_partner && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Partenaire:</Text>
              <Text style={styles.infoValue}>{selectedOrder.delivery_partner}</Text>
            </View>
          )}

          {selectedOrder.estimated_delivery && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Livraison estimée:</Text>
              <Text style={styles.infoValue}>
                {formatDate(selectedOrder.estimated_delivery)}
              </Text>
            </View>
          )}
        </Card>
      )}

      <Card style={styles.deliveryInfo}>
        <Text style={styles.sectionTitle}>Informations de livraison</Text>

        <View style={styles.deliveryRow}>
          <Icon name="location-on" size={20} color={colors.text.secondary} />
          <View style={styles.deliveryText}>
            {selectedOrder.delivery_method === 'pickup' ? (
              <>
                <Text style={styles.deliveryType}>Retrait en magasin</Text>
                {selectedOrder.pickup_location && (
                  <Text style={styles.deliveryAddress}>
                    {selectedOrder.pickup_location.name}
                    {'\n'}
                    {selectedOrder.pickup_location.address}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.deliveryType}>Livraison à domicile</Text>
                {selectedOrder.delivery_address && (
                  <Text style={styles.deliveryAddress}>
                    {selectedOrder.delivery_address.street}
                    {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.region}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => navigation.navigate('OrderChat' as any, { orderId: selectedOrder.id })}
        >
          <Icon name="chat" size={20} color={colors.primary} />
          <Text style={styles.contactButtonText}>Contacter le vendeur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigation.navigate('OrderDetails' as any, { orderId: selectedOrder.id })}
        >
          <Text style={styles.detailsButtonText}>Voir les détails</Text>
        </TouchableOpacity>
      </View>

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
    ...typography.body1,
    color: colors.primary,
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
  headerSpacer: {
    width: 24,
  },
  orderInfo: {
    margin: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  orderNumber: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  orderDate: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  trackingCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  timeline: {
    marginTop: spacing.md,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  stepLine: {
    width: 20,
    alignItems: 'center',
  },
  line: {
    width: 2,
    height: 40,
    marginTop: 30,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepText: {
    flex: 1,
  },
  stepLabel: {
    ...typography.body1,
    marginBottom: spacing.xs,
  },
  stepDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  trackingInfo: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  deliveryInfo: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  deliveryType: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  deliveryAddress: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  actions: {
    margin: spacing.lg,
    gap: spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contactButtonText: {
    ...typography.body1,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  detailsButton: {
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  detailsButtonText: {
    ...typography.body1,
    color: colors.text.white,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default OrderTrackingScreen;
