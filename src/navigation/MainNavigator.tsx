import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MainTabParamList } from './types';

// Import tab navigators
import HomeNavigator from './tabs/HomeNavigator';
import SearchNavigator from './tabs/SearchNavigator';
import SellNavigator from './tabs/SellNavigator';
import OrdersNavigator from './tabs/OrdersNavigator';
import ProfileNavigator from './tabs/ProfileNavigator';

// Import icon components (you'll need to install react-native-vector-icons or similar)
import Icon from 'react-native-vector-icons/MaterialIcons';

const MainTab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { itemCount } = useSelector((state: RootState) => state.cart);

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e1e5e9',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#666666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home';
              break;
            case 'SearchTab':
              iconName = focused ? 'search' : 'search';
              break;
            case 'SellTab':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'OrdersTab':
              iconName = focused ? 'shopping-bag' : 'shopping-bag';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen 
        name="HomeTab" 
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Accueil',
        }}
      />
      <MainTab.Screen 
        name="SearchTab" 
        component={SearchNavigator}
        options={{
          tabBarLabel: 'Recherche',
        }}
      />
      <MainTab.Screen 
        name="SellTab" 
        component={SellNavigator}
        options={{
          tabBarLabel: 'Vendre',
        }}
      />
      <MainTab.Screen 
        name="OrdersTab" 
        component={OrdersNavigator}
        options={{
          tabBarLabel: 'Commandes',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <MainTab.Screen 
        name="ProfileTab" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profil',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </MainTab.Navigator>
  );
};

export default MainNavigator;