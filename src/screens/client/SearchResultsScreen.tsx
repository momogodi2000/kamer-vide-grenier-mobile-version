import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { searchProducts, setSearchFilters } from '../../store/slices/productSlice';
import { Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Product, ProductSearchFilters } from '../../models';

type SearchResultsRouteProp = RouteProp<{ SearchResults: { query?: string; categoryId?: string; categoryName?: string } }, 'SearchResults'>;

const { width: screenWidth } = Dimensions.get('window');

const SearchResultsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<SearchResultsRouteProp>();
  const { searchResults, isSearching, pagination, searchFilters } = useSelector((state: RootState) => state.products);

  const { query = '', categoryId, categoryName } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'created_at' | 'views_count' | 'favorites_count'>('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const performSearch = useCallback(async (page = 1) => {
    try {
      const filters: ProductSearchFilters = {
        ...searchFilters,
        query: query || undefined,
        category_id: categoryId,
        sort_by: sortBy,
        page,
        limit: 20,
      };

      dispatch(setSearchFilters(filters));
      await dispatch(searchProducts(filters)).unwrap();
    } catch (searchError: any) {
      Alert.alert('Erreur', searchError.message || 'Erreur lors de la recherche');
    }
  }, [query, categoryId, sortBy, searchFilters, dispatch]);

  useEffect(() => {
    performSearch();
  }, [query, categoryId, sortBy, performSearch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await performSearch(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isSearching && pagination.page < pagination.total_pages) {
      performSearch(pagination.page + 1);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails' as any, { productId: product.id });
  };

  const handleFilterPress = () => {
    navigation.navigate('ProductFilter' as any);
  };

  const handleSortPress = () => {
    const options = [
      { label: 'Plus récent', value: 'created_at' },
      { label: 'Prix', value: 'price' },
      { label: 'Plus vues', value: 'views_count' },
      { label: 'Plus favoris', value: 'favorites_count' },
    ];

    // Simple sort selection - in a real app you'd use a proper modal/picker
    Alert.alert(
      'Trier par',
      '',
      options.map(option => ({
        text: option.label,
        onPress: () => setSortBy(option.value as any),
        style: sortBy === option.value ? 'default' : 'default',
      }))
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'created_at': return 'Récent';
      case 'price': return 'Prix';
      case 'views_count': return 'Vues';
      case 'favorites_count': return 'Favoris';
      default: return 'Récent';
    }
  };

  const renderProductGrid = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productGridItem}
      onPress={() => handleProductPress(item)}
    >
      <Card style={styles.productCard}>
        <View style={styles.productImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Text style={styles.productImagePlaceholder}>📷</Text>
          ) : (
            <Text style={styles.productImagePlaceholder}>📦</Text>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>
            {formatPrice(item.price)}
          </Text>
          <View style={styles.productLocation}>
            <Icon name="location-on" size={12} color={colors.text.secondary} />
            <Text style={styles.productLocationText} numberOfLines={1}>
              {item.city}, {item.region}
            </Text>
          </View>
          <Text style={styles.productDate}>
            {new Date(item.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {item.is_negotiable && (
          <View style={styles.negotiableBadge}>
            <Text style={styles.negotiableText}>Négociable</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderProductList = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productListItem}
      onPress={() => handleProductPress(item)}
    >
      <Card style={styles.productListCard}>
        <View style={styles.productListImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Text style={styles.productImagePlaceholder}>📷</Text>
          ) : (
            <Text style={styles.productImagePlaceholder}>📦</Text>
          )}
        </View>

        <View style={styles.productListInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>
            {formatPrice(item.price)}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.productListMeta}>
            <View style={styles.productLocation}>
              <Icon name="location-on" size={12} color={colors.text.secondary} />
              <Text style={styles.productLocationText}>
                {item.city}, {item.region}
              </Text>
            </View>
            <Text style={styles.productDate}>
              {new Date(item.created_at).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {item.is_negotiable && (
          <View style={styles.negotiableBadge}>
            <Text style={styles.negotiableText}>Négociable</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
      <Text style={styles.emptySubtitle}>
        Essayez de modifier vos critères de recherche
      </Text>
      <Button
        title="Modifier les filtres"
        onPress={handleFilterPress}
        style={styles.emptyButton}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {categoryName || `Résultats pour "${query}"`}
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={handleSortPress} style={styles.headerAction}>
          <Icon name="sort" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFilterPress} style={styles.headerAction}>
          <Icon name="filter-list" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          style={styles.headerAction}
        >
          <Icon
            name={viewMode === 'grid' ? 'view-list' : 'view-module'}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isSearching && pagination.page >= pagination.total_pages) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {pagination.total} résultat{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
        </Text>
        <Text style={styles.sortLabel}>
          Trié par: {getSortLabel()}
        </Text>
      </View>

      <FlatList
        data={searchResults}
        renderItem={viewMode === 'grid' ? renderProductGrid : renderProductList}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!isSearching ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
      />

      {isSearching && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Recherche en cours...</Text>
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
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.white,
  },
  resultsCount: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  sortLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  gridContainer: {
    padding: spacing.md,
  },
  listContainer: {
    padding: spacing.md,
  },
  productGridItem: {
    flex: 1,
    maxWidth: (screenWidth - spacing.md * 3) / 2,
    margin: spacing.xs,
  },
  productCard: {
    padding: spacing.md,
  },
  productListItem: {
    margin: spacing.xs,
  },
  productListCard: {
    padding: spacing.md,
    flexDirection: 'row',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  productListImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  productImagePlaceholder: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productListInfo: {
    flex: 1,
  },
  productTitle: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  productDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  productLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  productLocationText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  productDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  productListMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  negotiableBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  negotiableText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '500',
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
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.white + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.primary,
  },
});

export default SearchResultsScreen;
