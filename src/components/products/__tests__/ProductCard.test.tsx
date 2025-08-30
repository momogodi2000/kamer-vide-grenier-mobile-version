import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ProductCard from '../ProductCard';

const ProductWrapper = ({ children }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
);

const mockProduct = {
  id: 'test-product-id',
  title: 'Test Product',
  description: 'This is a test product',
  price: 50000,
  category: 'electronics',
  condition: 'new',
  images: ['https://example.com/image1.jpg'],
  location: 'Yaoundé',
  views: 100,
  isFavorite: false,
  createdAt: new Date().toISOString()
};

describe('ProductCard Component', () => {
  it('should render product information', () => {
    const { getByText } = render(
      <ProductWrapper>
        <ProductCard product={mockProduct} />
      </ProductWrapper>
    );

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('50 000 FCFA')).toBeTruthy();
    expect(getByText('Yaoundé')).toBeTruthy();
  });

  it('should display product image', () => {
    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={mockProduct} />
      </ProductWrapper>
    );

    const image = getByTestId('product-image');
    expect(image.props.source.uri).toBe('https://example.com/image1.jpg');
  });

  it('should handle favorite toggle', () => {
    const onFavoriteToggle = jest.fn();

    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={mockProduct} onFavoriteToggle={onFavoriteToggle} />
      </ProductWrapper>
    );

    const favoriteButton = getByTestId('favorite-button');
    fireEvent.press(favoriteButton);

    expect(onFavoriteToggle).toHaveBeenCalledWith(mockProduct.id);
  });

  it('should display favorite state correctly', () => {
    const favoriteProduct = { ...mockProduct, isFavorite: true };

    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={favoriteProduct} />
      </ProductWrapper>
    );

    const favoriteIcon = getByTestId('favorite-icon');
    expect(favoriteIcon.props.name).toBe('heart');
  });

  it('should navigate to product detail on press', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue({ navigate: mockNavigate });

    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={mockProduct} />
      </ProductWrapper>
    );

    const productCard = getByTestId('product-card');
    fireEvent.press(productCard);

    expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {
      productId: mockProduct.id
    });
  });

  it('should display condition badge', () => {
    const { getByText } = render(
      <ProductWrapper>
        <ProductCard product={mockProduct} />
      </ProductWrapper>
    );

    expect(getByText('products.condition.new')).toBeTruthy();
  });

  it('should display category', () => {
    const { getByText } = render(
      <ProductWrapper>
        <ProductCard product={mockProduct} />
      </ProductWrapper>
    );

    expect(getByText('categories.electronics')).toBeTruthy();
  });

  it('should format price correctly', () => {
    const expensiveProduct = { ...mockProduct, price: 1500000 };

    const { getByText } = render(
      <ProductWrapper>
        <ProductCard product={expensiveProduct} />
      </ProductWrapper>
    );

    expect(getByText('1 500 000 FCFA')).toBeTruthy();
  });

  it('should handle missing image gracefully', () => {
    const productWithoutImage = { ...mockProduct, images: [] };

    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={productWithoutImage} />
      </ProductWrapper>
    );

    const image = getByTestId('product-image');
    expect(image.props.source).toBeDefined();
  });

  it('should display views count', () => {
    const { getByText } = render(
      <ProductWrapper>
        <ProductCard product={mockProduct} />
      </ProductWrapper>
    );

    expect(getByText('100 products.views')).toBeTruthy();
  });

  it('should handle long product titles', () => {
    const longTitleProduct = { 
      ...mockProduct, 
      title: 'This is a very long product title that should be truncated properly'
    };

    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={longTitleProduct} />
      </ProductWrapper>
    );

    const titleText = getByTestId('product-title');
    expect(titleText.props.numberOfLines).toBe(2);
  });

  it('should display time ago correctly', () => {
    const recentProduct = { 
      ...mockProduct, 
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    };

    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={recentProduct} />
      </ProductWrapper>
    );

    const timeText = getByTestId('product-time');
    expect(timeText).toBeTruthy();
  });

  it('should handle product without views', () => {
    const productWithoutViews = { ...mockProduct, views: 0 };

    const { getByText } = render(
      <ProductWrapper>
        <ProductCard product={productWithoutViews} />
      </ProductWrapper>
    );

    expect(getByText('0 products.views')).toBeTruthy();
  });

  it('should apply correct styling for different conditions', () => {
    const usedProduct = { ...mockProduct, condition: 'used' };

    const { getByTestId } = render(
      <ProductWrapper>
        <ProductCard product={usedProduct} />
      </ProductWrapper>
    );

    const conditionBadge = getByTestId('condition-badge');
    expect(conditionBadge).toBeTruthy();
  });
});