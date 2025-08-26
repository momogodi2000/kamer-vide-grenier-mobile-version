import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchStackParamList } from '../types';

// Placeholder components
const SearchScreen = () => <></>;
const SearchResultsScreen = () => <></>;
const ProductFilterScreen = () => <></>;

const SearchStack = createStackNavigator<SearchStackParamList>();

const SearchNavigator: React.FC = () => {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="SearchResults" component={SearchResultsScreen} />
      <SearchStack.Screen name="ProductFilter" component={ProductFilterScreen} />
    </SearchStack.Navigator>
  );
};

export default SearchNavigator;