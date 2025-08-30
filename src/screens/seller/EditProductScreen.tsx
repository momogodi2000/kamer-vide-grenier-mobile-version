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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { updateProduct, getCategories } from '../../store/slices/productSlice';
import { Button, Card, TextInput } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Product, Region, DeliveryOptions, ProductCondition } from '../../models';

type EditProductRouteProp = RouteProp<{ EditProduct: { product: Product } }, 'EditProduct'>;

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category_id: string;
  condition: ProductCondition;
  images: string[];
  city: string;
  region: Region;
  location: string;
  delivery_options: DeliveryOptions;
  is_negotiable: boolean;
  quantity: string;
}

const EditProductScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<EditProductRouteProp>();
  const { isLoading } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.products);

  const { product } = route.params;

  const [formData, setFormData] = useState<ProductFormData>({
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    category_id: product.category_id,
    condition: product.condition,
    images: product.images || [],
    city: product.city || '',
    region: product.region,
    location: product.location || '',
    delivery_options: product.delivery_options || {
      pickup_available: true,
      delivery_available: true,
      shipping_available: false,
      express_delivery: false,
    },
    is_negotiable: product.is_negotiable,
    quantity: product.quantity.toString(),
  });

  const [selectedCategory, setSelectedCategory] = useState<any>(
    categories.find(cat => cat.id === product.category_id) || null
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const conditions = [
    { value: 'neuf', label: 'Neuf', description: 'Jamais utilisé' },
    { value: 'comme_neuf', label: 'Comme neuf', description: 'Légèrement utilisé' },
    { value: 'tres_bon_etat', label: 'Très bon état', description: 'Quelques signes d\'usure' },
    { value: 'bon_etat', label: 'Bon état', description: 'Usé mais fonctionnel' },
    { value: 'etat_correct', label: 'État correct', description: 'Nécessite réparation' },
    { value: 'pour_pieces', label: 'Pour pièces', description: 'Non fonctionnel' },
  ];

  const handleImagePick = async () => {
    if (formData.images.length >= 8) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 8 photos');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as any,
      selectionLimit: 8 - formData.images.length,
    };

    try {
      const response: ImagePickerResponse = await launchImageLibrary(options);

      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Erreur', response.errorMessage);
        return;
      }

      if (response.assets) {
        const newImages = response.assets.map(asset => asset.uri).filter(Boolean) as string[];
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner les images');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category_id: category.id }));
    setShowCategoryPicker(false);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'La description est requise');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Erreur', 'Le prix doit être supérieur à 0');
      return false;
    }
    if (!formData.category_id) {
      Alert.alert('Erreur', 'La catégorie est requise');
      return false;
    }
    if (formData.images.length === 0) {
      Alert.alert('Erreur', 'Au moins une photo est requise');
      return false;
    }
    if (!formData.city.trim() || !formData.region) {
      Alert.alert('Erreur', 'La localisation est requise');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const updateData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
      };

      await dispatch(updateProduct({ productId: product.id, productData: updateData })).unwrap();
      Alert.alert(
        'Succès',
        'Votre produit a été mis à jour avec succès!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour du produit');
    }
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.productImage} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <Icon name="close" size={20} color={colors.text.white} />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={styles.categoryItemText}>{item.name}</Text>
      <Icon name="chevron-right" size={24} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  if (showCategoryPicker) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choisir une catégorie</Text>
          <View style={styles.headerSpacer} />
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          style={styles.categoryList}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le produit</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        {/* Images */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Photos du produit</Text>
          <Text style={styles.sectionDescription}>
            Ajoutez jusqu'à 8 photos de haute qualité
          </Text>

          <FlatList
            data={formData.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListFooterComponent={
              formData.images.length < 8 ? (
                <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                  <Icon name="add-a-photo" size={48} color={colors.text.secondary} />
                  <Text style={styles.addImageText}>Ajouter</Text>
                </TouchableOpacity>
              ) : null
            }
            style={styles.imagesList}
          />
        </Card>

        {/* Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>

          <TextInput
            label="Titre du produit"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Ex: iPhone 12 Pro Max 256GB"
            maxLength={100}
          />

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Décrivez votre produit en détail..."
            multiline
            numberOfLines={4}
            maxLength={1000}
            style={styles.descriptionInput}
          />

          <View style={styles.priceRow}>
            <TextInput
              label="Prix (XAF)"
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              placeholder="0"
              keyboardType="numeric"
              style={styles.priceInput}
            />

            <TouchableOpacity
              style={[styles.negotiableButton, formData.is_negotiable && styles.negotiableButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, is_negotiable: !prev.is_negotiable }))}
            >
              <Text style={[styles.negotiableText, formData.is_negotiable && styles.negotiableTextActive]}>
                Négociable
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Category */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Catégorie</Text>

          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={selectedCategory ? styles.categorySelectedText : styles.categoryPlaceholderText}>
              {selectedCategory ? selectedCategory.name : 'Sélectionner une catégorie'}
            </Text>
            <Icon name="expand-more" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </Card>

        {/* Condition */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>État du produit</Text>

          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition.value}
              style={[
                styles.conditionItem,
                formData.condition === condition.value && styles.conditionItemSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, condition: condition.value as ProductCondition }))}
            >
              <View style={styles.conditionContent}>
                <Text style={[styles.conditionLabel, formData.condition === condition.value && styles.conditionLabelSelected]}>
                  {condition.label}
                </Text>
                <Text style={[styles.conditionDescription, formData.condition === condition.value && styles.conditionDescriptionSelected]}>
                  {condition.description}
                </Text>
              </View>
              {formData.condition === condition.value && (
                <Icon name="check-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Quantity & Location */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Détails supplémentaires</Text>

          <TextInput
            label="Quantité disponible"
            value={formData.quantity}
            onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
            placeholder="1"
            keyboardType="numeric"
          />

          <TextInput
            label="Ville"
            value={formData.city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
            placeholder="Ex: Douala"
          />

          <TextInput
            label="Région"
            value={formData.region}
            onChangeText={(text) => setFormData(prev => ({ ...prev, region: text as Region }))}
            placeholder="Ex: Littoral"
          />
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Mettre à jour le produit"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
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
  headerSpacer: {
    width: 24,
  },
  form: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  imagesList: {
    marginTop: spacing.md,
  },
  imageContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  addImageText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  priceInput: {
    flex: 1,
  },
  negotiableButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.white,
  },
  negotiableButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  negotiableText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  negotiableTextActive: {
    color: colors.text.white,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.white,
  },
  categorySelectedText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  categoryPlaceholderText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.white,
  },
  categoryItemText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  conditionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  conditionContent: {
    flex: 1,
  },
  conditionLabel: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  conditionLabelSelected: {
    color: colors.primary,
  },
  conditionDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: 2,
  },
  conditionDescriptionSelected: {
    color: colors.primary,
  },
  submitContainer: {
    paddingVertical: spacing.xl,
  },
  submitButton: {
    marginHorizontal: spacing.lg,
  },
});

export default EditProductScreen;
