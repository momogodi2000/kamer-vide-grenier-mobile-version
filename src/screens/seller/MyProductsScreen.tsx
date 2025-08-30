import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { getMyProducts, deleteProduct } from '../../store/slices/productSlice';
import { Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Product, ProductStatus } from '../../models';

interface ProductItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onView: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onEdit, onDelete, onView }) => {
  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'sold':
        return colors.info;
      case 'expired':
      case 'banned':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'sold':
        return 'Vendu';
      case 'expired':
        return 'Expiré';
      case 'banned':
        return 'Bloqué';
      case 'draft':
        return 'Brouillon';
      case 'reserved':
        return 'Réservé';
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  };

  return (
    <Card style={styles.productCard}>
      <TouchableOpacity style={styles.productContent} onPress={() => onView(product)}>
        <View style={styles.productImageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="image" size={40} color={colors.text.secondary} />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) }]}>
            <Text style={styles.statusText}>{getStatusText(product.status)}</Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.productPrice}>
            {product.price.toLocaleString('fr-FR')} XAF
          </Text>
          <View style={styles.productMeta}>
            <Text style={styles.productMetaText}>
              {product.views_count || 0} vues
            </Text>
            <Text style={styles.productMetaText}>
              {product.favorites_count || 0} favoris
            </Text>
          </View>
          <Text style={styles.productDate}>
            {new Date(product.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(product)}
        >
          <Icon name="edit" size={20} color={colors.primary} />
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(product.id)}
        >
          <Icon name="delete" size={20} color={colors.error} />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const MyProductsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { myProducts, isLoading, error, pagination } = useSelector((state: RootState) => state.products);

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async (pageNum = 1) => {
    try {
      await dispatch(getMyProducts({ page: pageNum, limit: 20 })).unwrap();
      setPage(pageNum);
    } catch (loadError: any) {
      Alert.alert('Erreur', 'Impossible de charger vos produits');
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts(1);
    setRefreshing(false);
  }, [loadProducts]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && pagination && page < pagination.total_pages) {
      loadProducts(page + 1);
    }
  }, [isLoading, pagination, page, loadProducts]);

  const handleEditProduct = useCallback((product: Product) => {
    navigation.navigate('EditProduct' as any, { product });
  }, [navigation]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
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
              await dispatch(deleteProduct(productId)).unwrap();
              Alert.alert('Succès', 'Produit supprimé avec succès');
              loadProducts(1); // Reload the list
            } catch (deleteError: any) {
              Alert.alert('Erreur', deleteError.message || 'Échec de la suppression');
            }
          },
        },
      ]
    );
  }, [dispatch, loadProducts]);

  const handleViewProduct = useCallback((product: Product) => {
    navigation.navigate('ProductDetails' as any, { productId: product.id });
  }, [navigation]);

  const handleCreateProduct = useCallback(() => {
    navigation.navigate('CreateProduct' as any);
  }, [navigation]);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductItem
      product={item}
      onEdit={handleEditProduct}
      onDelete={handleDeleteProduct}
      onView={handleViewProduct}
    />
  ), [handleEditProduct, handleDeleteProduct, handleViewProduct]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inventory" size={80} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptySubtitle}>
        Vous n'avez pas encore créé de produits.{'\n'}Commencez par en créer un !
      </Text>
      <Button
        title="Créer mon premier produit"
        onPress={handleCreateProduct}
        style={styles.createButton}
      />
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>Chargement...</Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={80} color={colors.error} />
        <Text style={styles.errorTitle}>Erreur de chargement</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <Button
          title="Réessayer"
          onPress={() => loadProducts(1)}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes produits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateProduct}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />

      {pagination && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {pagination.total} produit{pagination.total > 1 ? 's' : ''} • Page {pagination.page}/{pagination.total_pages}
          </Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  productCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  productContent: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  productMeta: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  productMetaText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginRight: spacing.md,
  },
  productDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  editButton: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  deleteButton: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    ...typography.body2,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  createButton: {
    minWidth: 200,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    minWidth: 150,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statsText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default MyProductsScreen;
