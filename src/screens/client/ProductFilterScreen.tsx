import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { setSearchFilters } from '../../store/slices/productSlice';
import { Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ProductSearchFilters } from '../../models';

const ProductFilterScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { searchFilters, categories } = useSelector((state: RootState) => state.products);

  const [filters, setFilters] = useState<ProductSearchFilters>({
    ...searchFilters,
    min_price: searchFilters.min_price || undefined,
    max_price: searchFilters.max_price || undefined,
    condition: searchFilters.condition || undefined,
    city: searchFilters.city || undefined,
    region: searchFilters.region || undefined,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(filters.category_id);
  const [selectedCondition, setSelectedCondition] = useState<string | undefined>(
    Array.isArray(filters.condition) ? filters.condition[0] : filters.condition
  );

  const conditions = [
    { value: 'neuf', label: 'Neuf' },
    { value: 'comme_neuf', label: 'Comme neuf' },
    { value: 'tres_bon_etat', label: 'Très bon état' },
    { value: 'bon_etat', label: 'Bon état' },
    { value: 'etat_correct', label: 'État correct' },
    { value: 'pour_pieces', label: 'Pour pièces' },
  ];

  const regions = [
    'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
  ];

  const handleApplyFilters = () => {
    const updatedFilters: ProductSearchFilters = {
      ...filters,
      category_id: selectedCategory,
      condition: selectedCondition as any, // Cast to match the expected type
    };

    dispatch(setSearchFilters(updatedFilters));
    navigation.goBack();
  };

  const handleClearFilters = () => {
    const clearedFilters: ProductSearchFilters = {
      query: filters.query, // Keep the search query
    };

    setFilters(clearedFilters);
    setSelectedCategory(undefined);
    setSelectedCondition(undefined);
    dispatch(setSearchFilters(clearedFilters));
  };

  const updateFilter = (key: keyof ProductSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderPriceRange = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Prix (XAF)</Text>
      <View style={styles.priceInputs}>
        <TouchableOpacity
          style={styles.priceInput}
          onPress={() => {
            // In a real app, you'd show a number input modal or picker
            Alert.prompt('Prix minimum', 'Entrez le prix minimum', (text) => {
              const value = text ? parseInt(text, 10) : undefined;
              updateFilter('min_price', value);
            });
          }}
        >
          <Text style={filters.min_price ? styles.inputText : styles.placeholderText}>
            {filters.min_price || 'Min'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.priceSeparator}>-</Text>
        <TouchableOpacity
          style={styles.priceInput}
          onPress={() => {
            Alert.prompt('Prix maximum', 'Entrez le prix maximum', (text) => {
              const value = text ? parseInt(text, 10) : undefined;
              updateFilter('max_price', value);
            });
          }}
        >
          <Text style={filters.max_price ? styles.inputText : styles.placeholderText}>
            {filters.max_price || 'Max'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderCategories = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
          onPress={() => setSelectedCategory(undefined)}
        >
          <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextSelected]}>
            Toutes
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextSelected]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );

  const renderCondition = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>État du produit</Text>
      <View style={styles.conditionGrid}>
        {conditions.map((condition) => (
          <TouchableOpacity
            key={condition.value}
            style={[styles.conditionItem, selectedCondition === condition.value && styles.conditionItemSelected]}
            onPress={() => setSelectedCondition(selectedCondition === condition.value ? undefined : condition.value)}
          >
            <Text style={[styles.conditionText, selectedCondition === condition.value && styles.conditionTextSelected]}>
              {condition.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderLocation = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Localisation</Text>

      <TouchableOpacity
        style={styles.locationInput}
        onPress={() => {
          Alert.prompt('Ville', 'Entrez le nom de la ville', (text) => {
            updateFilter('city', text || undefined);
          });
        }}
      >
        <Icon name="location-city" size={20} color={colors.text.secondary} />
        <Text style={filters.city ? styles.inputText : styles.placeholderText}>
          {filters.city || 'Ville'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.locationInput}
        onPress={() => {
          // In a real app, you'd show a picker with regions
          Alert.alert('Région', 'Sélectionnez une région', regions.map(region => ({
            text: region,
            onPress: () => updateFilter('region', region),
          })));
        }}
      >
        <Icon name="location-on" size={20} color={colors.text.secondary} />
        <Text style={filters.region ? styles.inputText : styles.placeholderText}>
          {filters.region || 'Région'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtres</Text>
        <TouchableOpacity onPress={handleClearFilters}>
          <Text style={styles.clearText}>Effacer</Text>
        </TouchableOpacity>
      </View>

      {renderPriceRange()}
      {renderCategories()}
      {renderCondition()}
      {renderLocation()}

      <View style={styles.actions}>
        <Button
          title="Appliquer les filtres"
          onPress={handleApplyFilters}
          style={styles.applyButton}
        />
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
  clearText: {
    ...typography.body1,
    color: colors.primary,
  },
  section: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background.white,
  },
  priceSeparator: {
    ...typography.body1,
    color: colors.text.secondary,
    marginHorizontal: spacing.sm,
  },
  inputText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  placeholderText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  categoriesScroll: {
    marginTop: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    marginRight: spacing.sm,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  categoryChipTextSelected: {
    color: colors.text.white,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionItem: {
    width: '48%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    margin: '1%',
    alignItems: 'center',
  },
  conditionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  conditionText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  conditionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background.white,
    marginBottom: spacing.sm,
  },
  actions: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
});

export default ProductFilterScreen;
