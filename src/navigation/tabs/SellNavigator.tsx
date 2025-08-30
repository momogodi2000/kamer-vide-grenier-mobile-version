import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SellStackParamList } from '../types';

// Placeholder components
const MyProductsScreen = () => <></>;
const CreateProductScreen = () => <></>;
const ProductPreviewScreen = () => <></>;
const ImageUploadScreen = () => <></>;
const CategorySelectorScreen = () => <></>;

// Actual components
import EditProductScreen from '../../screens/seller/EditProductScreen';
import ProductDetailsScreen from '../../screens/seller/ProductDetailsScreen';

const SellStack = createStackNavigator<SellStackParamList>();

const SellNavigator: React.FC = () => {
  return (
    <SellStack.Navigator>
      <SellStack.Screen name="MyProducts" component={MyProductsScreen} />
      <SellStack.Screen name="CreateProduct" component={CreateProductScreen} />
      <SellStack.Screen name="EditProduct" component={EditProductScreen} />
      <SellStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <SellStack.Screen name="ProductPreview" component={ProductPreviewScreen} />
      <SellStack.Screen name="ImageUpload" component={ImageUploadScreen} />
      <SellStack.Screen name="CategorySelector" component={CategorySelectorScreen} />
    </SellStack.Navigator>
  );
};

export default SellNavigator;