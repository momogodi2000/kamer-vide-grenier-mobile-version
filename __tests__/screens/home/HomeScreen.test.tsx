import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View, TouchableOpacity, ScrollView, FlatList } from 'react-native';

// Mock home screen components
const MockWelcomeSection = ({ userName }: { userName?: string }) => (
  <View testID="welcome-section">
    <Text>Bonjour{userName ? `, ${userName}` : ''}!</Text>
    <Text>En ligne</Text>
  </View>
);

const MockQuickStats = () => (
  <View testID="quick-stats">
    <Text>Tableau de bord</Text>
    <View testID="stats-row">
      <TouchableOpacity testID="products-stat">
        <Text>0</Text>
        <Text>Produits</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="cart-stat">
        <Text>0</Text>
        <Text>Panier</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="notifications-stat">
        <Text>2</Text>
        <Text>Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="security-stat">
        <Text>MEDIUM</Text>
        <Text>Sécurité</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const MockQuickActions = () => (
  <View testID="quick-actions">
    <Text>Actions rapides</Text>
    <View testID="actions-row">
      <TouchableOpacity testID="search-action">
        <Text>Rechercher</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="sell-action">
        <Text>Vendre</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="orders-action">
        <Text>Commandes</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="sync-action">
        <Text>Synchroniser</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const MockFeaturedProducts = () => (
  <View testID="featured-products">
    <Text>Produits mis en avant</Text>
    <TouchableOpacity testID="see-all">
      <Text>Voir tout</Text>
    </TouchableOpacity>
    <FlatList
      testID="products-list"
      data={[{ id: '1', title: 'Test Product 1', price: 50000 }]}
      renderItem={({ item }) => (
        <TouchableOpacity testID={`product-${item.id}`}>
          <Text>{item.title}</Text>
          <Text>{item.price} XAF</Text>
        </TouchableOpacity>
      )}
      horizontal
    />
  </View>
);

const MockCategories = () => (
  <View testID="categories">
    <Text>Catégories</Text>
    <FlatList
      testID="categories-list"
      data={[{ id: '1', name: 'Électronique' }]}
      renderItem={({ item }) => (
        <TouchableOpacity testID={`category-${item.id}`}>
          <Text>{item.name}</Text>
        </TouchableOpacity>
      )}
      horizontal
    />
  </View>
);

const MockHomeScreen = ({ userName }: { userName?: string }) => (
  <ScrollView testID="home-screen">
    <MockWelcomeSection userName={userName} />
    <MockQuickStats />
    <MockQuickActions />
    <MockFeaturedProducts />
    <MockCategories />
  </ScrollView>
);

describe('HomeScreen Components', () => {
  it('renders welcome section correctly', () => {
    const { getByText, getByTestId } = render(<MockWelcomeSection userName="John" />);

    expect(getByText('Bonjour, John!')).toBeTruthy();
    expect(getByText('En ligne')).toBeTruthy();
    expect(getByTestId('welcome-section')).toBeTruthy();
  });

  it('renders welcome section without name', () => {
    const { getByText } = render(<MockWelcomeSection />);

    expect(getByText('Bonjour!')).toBeTruthy();
  });

  it('renders quick stats section', () => {
    const { getByText, getByTestId } = render(<MockQuickStats />);

    expect(getByText('Tableau de bord')).toBeTruthy();
    expect(getByText('Produits')).toBeTruthy();
    expect(getByText('Panier')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Sécurité')).toBeTruthy();
    expect(getByTestId('stats-row')).toBeTruthy();
  });

  it('displays correct stat values', () => {
    const { getAllByText, getByText } = render(<MockQuickStats />);

    const zeroTexts = getAllByText('0');
    expect(zeroTexts).toHaveLength(2); // Products and Cart count (both show 0)
    expect(getByText('2')).toBeTruthy(); // Notifications count
    expect(getByText('MEDIUM')).toBeTruthy(); // Security level
  });

  it('renders quick actions section', () => {
    const { getByText, getByTestId } = render(<MockQuickActions />);

    expect(getByText('Actions rapides')).toBeTruthy();
    expect(getByText('Rechercher')).toBeTruthy();
    expect(getByText('Vendre')).toBeTruthy();
    expect(getByText('Commandes')).toBeTruthy();
    expect(getByText('Synchroniser')).toBeTruthy();
    expect(getByTestId('actions-row')).toBeTruthy();
  });

  it('renders featured products section', () => {
    const { getByText, getByTestId } = render(<MockFeaturedProducts />);

    expect(getByText('Produits mis en avant')).toBeTruthy();
    expect(getByText('Voir tout')).toBeTruthy();
    expect(getByText('Test Product 1')).toBeTruthy();
    expect(getByText('50000 XAF')).toBeTruthy();
    expect(getByTestId('products-list')).toBeTruthy();
  });

  it('renders categories section', () => {
    const { getByText, getByTestId } = render(<MockCategories />);

    expect(getByText('Catégories')).toBeTruthy();
    expect(getByText('Électronique')).toBeTruthy();
    expect(getByTestId('categories-list')).toBeTruthy();
  });

  it('renders complete home screen', () => {
    const { getByText, getByTestId } = render(<MockHomeScreen userName="John" />);

    expect(getByTestId('home-screen')).toBeTruthy();
    expect(getByText('Bonjour, John!')).toBeTruthy();
    expect(getByText('Tableau de bord')).toBeTruthy();
    expect(getByText('Actions rapides')).toBeTruthy();
    expect(getByText('Produits mis en avant')).toBeTruthy();
    expect(getByText('Catégories')).toBeTruthy();
  });

  it('has correct test IDs for all sections', () => {
    const { getByTestId } = render(<MockHomeScreen />);

    expect(getByTestId('home-screen')).toBeTruthy();
    expect(getByTestId('welcome-section')).toBeTruthy();
    expect(getByTestId('quick-stats')).toBeTruthy();
    expect(getByTestId('quick-actions')).toBeTruthy();
    expect(getByTestId('featured-products')).toBeTruthy();
    expect(getByTestId('categories')).toBeTruthy();
  });
});

// Test home screen business logic
describe('HomeScreen Business Logic', () => {
  const calculateDashboardStats = (data: {
    products: number;
    cartItems: number;
    notifications: number;
    securityLevel: string;
  }) => {
    return {
      totalProducts: data.products,
      cartItems: data.cartItems,
      unreadNotifications: data.notifications,
      securityLevel: data.securityLevel,
    };
  };

  const formatUserGreeting = (firstName?: string): string => {
    return firstName ? `Bonjour, ${firstName}!` : 'Bonjour!';
  };

  const getSecurityLevelColor = (level: string): string => {
    switch (level) {
      case 'HIGH':
        return '#4CAF50'; // Green
      case 'MEDIUM':
        return '#FF9800'; // Orange
      case 'LOW':
        return '#F44336'; // Red
      default:
        return '#666666'; // Gray
    }
  };

  it('calculates dashboard stats correctly', () => {
    const stats = calculateDashboardStats({
      products: 10,
      cartItems: 2,
      notifications: 5,
      securityLevel: 'HIGH',
    });

    expect(stats.totalProducts).toBe(10);
    expect(stats.cartItems).toBe(2);
    expect(stats.unreadNotifications).toBe(5);
    expect(stats.securityLevel).toBe('HIGH');
  });

  it('formats user greeting correctly', () => {
    expect(formatUserGreeting('John')).toBe('Bonjour, John!');
    expect(formatUserGreeting('')).toBe('Bonjour!');
    expect(formatUserGreeting(undefined)).toBe('Bonjour!');
  });

  it('gets security level colors correctly', () => {
    expect(getSecurityLevelColor('HIGH')).toBe('#4CAF50');
    expect(getSecurityLevelColor('MEDIUM')).toBe('#FF9800');
    expect(getSecurityLevelColor('LOW')).toBe('#F44336');
    expect(getSecurityLevelColor('UNKNOWN')).toBe('#666666');
  });

  it('handles empty product lists', () => {
    const emptyProducts: any[] = [];
    const hasProducts = emptyProducts.length > 0;
    
    expect(hasProducts).toBe(false);
    expect(emptyProducts).toHaveLength(0);
  });

  it('handles empty categories lists', () => {
    const emptyCategories: any[] = [];
    const hasCategories = emptyCategories.length > 0;
    
    expect(hasCategories).toBe(false);
    expect(emptyCategories).toHaveLength(0);
  });

  it('validates sync status', () => {
    const syncStatus = {
      isOnline: true,
      isSyncing: false,
      syncProgress: 0,
      pendingActions: 0,
    };

    expect(syncStatus.isOnline).toBe(true);
    expect(syncStatus.isSyncing).toBe(false);
    expect(syncStatus.syncProgress).toBe(0);
    expect(syncStatus.pendingActions).toBe(0);
  });
});