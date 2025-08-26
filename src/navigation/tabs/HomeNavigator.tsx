import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from '../types';

// Placeholder components - will be implemented later
const HomeScreen = () => <></>;
const ProductDetailsScreen = () => <></>;
const ProductListScreen = () => <></>;
const CategoryListScreen = () => <></>;
const CategoryProductsScreen = () => <></>;
const SellerProfileScreen = () => <></>;

const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <HomeStack.Screen name="ProductList" component={ProductListScreen} />
      <HomeStack.Screen name="CategoryList" component={CategoryListScreen} />
      <HomeStack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <HomeStack.Screen name="SellerProfile" component={SellerProfileScreen} />
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;