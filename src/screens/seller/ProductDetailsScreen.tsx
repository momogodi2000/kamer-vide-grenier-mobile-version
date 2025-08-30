import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { getProductById, deleteProduct } from '../../store/slices/productSlice';
import { Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

type ProductDetailsRouteProp = RouteProp<{ ProductDetails: { productId: string } }, 'ProductDetails'>;

const { width: screenWidth } = Dimensions.get('window');

const ProductDetailsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<ProductDetailsRouteProp>();
  const { selectedProduct, isLoading } = useSelector((state: RootState) => state.products);

  const { productId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId));
    }
  }, [dispatch, productId]);

  const handleEditProduct = () => {
    if (selectedProduct) {
      navigation.navigate('EditProduct' as any, { product: selectedProduct });
    }
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    Alert.alert(
      'Supprimer le produit',
      'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteProduct(selectedProduct.id)).unwrap();
              Alert.alert('Succès', 'Produit supprimé avec succès', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Échec de la suppression');
            }
          },
        },
      ]
    );
  };

  const handleShareProduct = () => {
    // TODO: Implement share functionality
    Alert.alert('Partager', 'Fonctionnalité de partage à venir');
  };

  const handleViewStats = () => {
    // TODO: Implement product statistics
    Alert.alert('Statistiques', 'Statistiques du produit à venir');
  };

  const renderImageItem = ({ item, index: _index }: { item: string; index: number }) => (
    <Image
      source={{ uri: item }}
      style={styles.productImage}
      resizeMode="cover"
    />
  );

  const handleImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentImageIndex(roundIndex);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!selectedProduct) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produit non trouvé</Text>
        <Button
          title="Retour"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getConditionLabel = (condition: string) => {
    const conditions: { [key: string]: string } = {
      neuf: 'Neuf',
      comme_neuf: 'Comme neuf',
      tres_bon_etat: 'Très bon état',
      bon_etat: 'Bon état',
      etat_correct: 'État correct',
      pour_pieces: 'Pour pièces',
    };
    return conditions[condition] || condition;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'sold':
        return colors.error;
      case 'inactive':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'sold':
        return 'Vendu';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du produit</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShareProduct} style={styles.headerAction}>
            <Icon name="share" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleViewStats} style={styles.headerAction}>
            <Icon name="bar-chart" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Images */}
      <View style={styles.imageContainer}>
        <FlatList
          data={selectedProduct.images || []}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleImageScroll}
          style={styles.imageSlider}
        />
        {selectedProduct.images && selectedProduct.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {selectedProduct.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageIndicator,
                  index === currentImageIndex && styles.imageIndicatorActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedProduct.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(selectedProduct.status)}</Text>
            </View>
            {selectedProduct.is_negotiable && (
              <View style={styles.negotiableBadge}>
                <Text style={styles.negotiableText}>Négociable</Text>
              </View>
            )}
          </View>

          <Text style={styles.productTitle}>{selectedProduct.title}</Text>
          <Text style={styles.productPrice}>{formatPrice(selectedProduct.price)}</Text>

          <View style={styles.productMeta}>
            <View style={styles.metaItem}>
              <Icon name="category" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>Catégorie</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="location-on" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>{selectedProduct.city}, {selectedProduct.region}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="access-time" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>Publié le {formatDate(selectedProduct.created_at.toISOString())}</Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{selectedProduct.description}</Text>
        </Card>

        {/* Product Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Détails du produit</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>État :</Text>
            <Text style={styles.detailValue}>{getConditionLabel(selectedProduct.condition)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantité disponible :</Text>
            <Text style={styles.detailValue}>{selectedProduct.quantity}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vues :</Text>
            <Text style={styles.detailValue}>{selectedProduct.views_count || 0}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Favoris :</Text>
            <Text style={styles.detailValue}>{selectedProduct.favorites_count || 0}</Text>
          </View>

          {selectedProduct.delivery_options && (
            <>
              <Text style={[styles.sectionTitle, styles.deliveryTitle]}>Options de livraison</Text>
              <View style={styles.deliveryOptions}>
                {selectedProduct.delivery_options.pickup_available && (
                  <View style={styles.deliveryOption}>
                    <Icon name="store" size={16} color={colors.success} />
                    <Text style={styles.deliveryText}>Retrait en magasin</Text>
                  </View>
                )}
                {selectedProduct.delivery_options.delivery_available && (
                  <View style={styles.deliveryOption}>
                    <Icon name="local-shipping" size={16} color={colors.success} />
                    <Text style={styles.deliveryText}>Livraison disponible</Text>
                  </View>
                )}
                {selectedProduct.delivery_options.shipping_available && (
                  <View style={styles.deliveryOption}>
                    <Icon name="flight" size={16} color={colors.success} />
                    <Text style={styles.deliveryText}>Expédition possible</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Modifier le produit"
            onPress={handleEditProduct}
            style={styles.editButton}
          />
          <Button
            title="Supprimer le produit"
            onPress={handleDeleteProduct}
            style={styles.deleteButton}
            variant="outline"
          />
        </View>
      </View>
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
    ...typography.h2,
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
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
  },
  imageSlider: {
    height: 300,
  },
  productImage: {
    width: screenWidth,
    height: 300,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.white + '80',
    marginHorizontal: 4,
  },
  imageIndicatorActive: {
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '500',
  },
  negotiableBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  negotiableText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '500',
  },
  productTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  productMeta: {
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  descriptionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.body1,
    color: colors.text.primary,
    lineHeight: 24,
  },
  detailsCard: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailLabel: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  deliveryTitle: {
    marginTop: spacing.lg,
  },
  deliveryOptions: {
    marginTop: spacing.sm,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  deliveryText: {
    ...typography.body2,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  actionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.error,
  },
});

export default ProductDetailsScreen;
