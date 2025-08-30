import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState, AppDispatch } from '../../store';
import { getCategories, getFeaturedProducts } from '../../store/slices/productSlice';
import { Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Category } from '../../models';

const { width: screenWidth } = Dimensions.get('window');

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

const SearchScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { categories, featuredProducts } = useSelector((state: RootState) => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecentSearches();
    dispatch(getCategories());
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches.slice(0, 10)); // Keep only last 10 searches
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = useCallback(async (query: string) => {
    try {
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now(),
      };

      const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 10);
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }, [recentSearches]);

  const handleSearch = useCallback(async (query: string = searchQuery) => {
    if (!query.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un terme de recherche');
      return;
    }

    setIsLoading(true);
    try {
      await saveRecentSearch(query);
      navigation.navigate('SearchResults' as any, { query });
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, navigation, saveRecentSearch]);

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('SearchResults' as any, {
      query: '',
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const handleClearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const handleFeaturedProductPress = (productId: string) => {
    navigation.navigate('ProductDetails' as any, { productId });
  };

  const renderRecentSearchItem = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item.query)}
    >
      <Icon name="history" size={20} color={colors.text.secondary} />
      <Text style={styles.recentSearchText}>{item.query}</Text>
      <TouchableOpacity
        style={styles.removeRecentSearch}
        onPress={() => {
          const updated = recentSearches.filter(s => s.id !== item.id);
          setRecentSearches(updated);
          AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
        }}
      >
        <Icon name="close" size={16} color={colors.text.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryIcon}>
        <Icon name="category" size={24} color={colors.primary} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>Explorer</Text>
    </TouchableOpacity>
  );

  const renderFeaturedProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.featuredProduct}
      onPress={() => handleFeaturedProductPress(item.id)}
    >
      <Card style={styles.featuredProductCard}>
        <Text style={styles.featuredProductTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.featuredProductPrice}>
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
          }).format(item.price)}
        </Text>
        <View style={styles.featuredProductLocation}>
          <Icon name="location-on" size={14} color={colors.text.secondary} />
          <Text style={styles.featuredProductLocationText}>
            {item.city}, {item.region}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rechercher</Text>
        <Text style={styles.headerSubtitle}>Trouvez ce dont vous avez besoin</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Icon name="clear" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <Button
          title="Rechercher"
          onPress={() => handleSearch()}
          loading={isLoading}
          style={styles.searchButton}
        />
      </View>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recherches récentes</Text>
            <TouchableOpacity onPress={handleClearRecentSearches}>
              <Text style={styles.clearAllText}>Effacer tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearchItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.recentSearchesList}
          />
        </View>
      )}

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories populaires</Text>
        <FlatList
          data={categories.slice(0, 6)} // Show first 6 categories
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          style={styles.categoriesGrid}
        />
        {categories.length > 6 && (
          <TouchableOpacity style={styles.viewAllCategories}>
            <Text style={styles.viewAllText}>Voir toutes les catégories</Text>
            <Icon name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produits populaires</Text>
          <FlatList
            data={featuredProducts.slice(0, 4)}
            renderItem={renderFeaturedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredProductsList}
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="location-on" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Autour de moi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="local-offer" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Offres spéciales</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="new-releases" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Nouveautés</Text>
          </TouchableOpacity>
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background.white,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.white,
    marginBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  searchButton: {
    backgroundColor: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  clearAllText: {
    ...typography.body2,
    color: colors.primary,
  },
  recentSearchesList: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.md,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  recentSearchText: {
    ...typography.body1,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  removeRecentSearch: {
    padding: spacing.xs,
  },
  categoriesGrid: {
    marginTop: spacing.md,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.xs,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  categoryCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  viewAllCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  viewAllText: {
    ...typography.body1,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  featuredProductsList: {
    marginTop: spacing.md,
  },
  featuredProduct: {
    width: screenWidth * 0.7,
    marginRight: spacing.md,
  },
  featuredProductCard: {
    padding: spacing.md,
  },
  featuredProductTitle: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  featuredProductPrice: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  featuredProductLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredProductLocationText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default SearchScreen;
