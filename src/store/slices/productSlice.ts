import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category } from '../../models';
import { ProductSearchFilters, CreateProductRequest } from '../../models/Product';
import { productService } from '../../services';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  recentProducts: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  wishlist: Product[];
  myProducts: Product[];
  searchResults: Product[];
  searchFilters: ProductSearchFilters;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  recentProducts: [],
  categories: [],
  selectedProduct: null,
  wishlist: [],
  myProducts: [],
  searchResults: [],
  searchFilters: {},
  isLoading: false,
  isSearching: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  },
};

// Async thunks
export const searchProducts = createAsyncThunk(
  'products/search',
  async (filters: ProductSearchFilters, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(filters);
      if (response.success) {
        return response;
      }
      throw new Error('Search failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFeaturedProducts = createAsyncThunk(
  'products/getFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch featured products');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getRecentProducts = createAsyncThunk(
  'products/getRecent',
  async (limit: number = 20, { rejectWithValue }) => {
    try {
      const response = await productService.getRecentProducts(limit);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch recent products');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductById = createAsyncThunk(
  'products/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Product not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategories();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch categories');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMyProducts = createAsyncThunk(
  'products/getMyProducts',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await productService.getMyProducts(page, limit);
      if (response.success) {
        return response;
      }
      throw new Error('Failed to fetch my products');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: CreateProductRequest, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create product');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, productData }: { productId: string; productData: Partial<CreateProductRequest> }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(productId, productData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update product');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId: string, { rejectWithValue }) => {
    try {
      // For now, we'll assume the API call exists
      // const response = await productService.deleteProduct(productId);
      // if (response.success) {
      //   return productId;
      // }
      // throw new Error('Failed to delete product');
      return productId; // Temporary implementation
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'products/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await productService.addToWishlist(productId);
      if (response.success) {
        return productId;
      }
      throw new Error('Failed to add to wishlist');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'products/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await productService.removeFromWishlist(productId);
      if (response.success) {
        return productId;
      }
      throw new Error('Failed to remove from wishlist');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getWishlist = createAsyncThunk(
  'products/getWishlist',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await productService.getWishlist(page, limit);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch wishlist');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchFilters: (state, action: PayloadAction<ProductSearchFilters>) => {
      state.searchFilters = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchFilters = {};
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    updateProductInList: (state, action: PayloadAction<Product>) => {
      const updatedProduct = action.payload;
      
      // Update in all relevant arrays
      const updateProductInArray = (array: Product[]) => {
        const index = array.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          array[index] = updatedProduct;
        }
      };

      updateProductInArray(state.products);
      updateProductInArray(state.featuredProducts);
      updateProductInArray(state.recentProducts);
      updateProductInArray(state.searchResults);
      updateProductInArray(state.myProducts);
      updateProductInArray(state.wishlist);

      if (state.selectedProduct?.id === updatedProduct.id) {
        state.selectedProduct = updatedProduct;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      })
      
      // Get featured products
      .addCase(getFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get recent products
      .addCase(getRecentProducts.fulfilled, (state, action) => {
        state.recentProducts = action.payload;
      })
      
      // Get product by ID
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get categories
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      
      // Get my products
      .addCase(getMyProducts.fulfilled, (state, action) => {
        state.myProducts = action.payload.data;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProducts.unshift(action.payload); // Add to beginning of my products
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the product in myProducts array
        const index = state.myProducts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.myProducts[index] = action.payload;
        }
        // Also update in other arrays if present
        const updateInArray = (array: Product[]) => {
          const idx = array.findIndex(p => p.id === action.payload.id);
          if (idx !== -1) {
            array[idx] = action.payload;
          }
        };
        updateInArray(state.products);
        updateInArray(state.featuredProducts);
        updateInArray(state.recentProducts);
        updateInArray(state.searchResults);
        updateInArray(state.wishlist);
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const productId = action.payload;
        state.myProducts = state.myProducts.filter(product => product.id !== productId);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Wishlist actions
      .addCase(addToWishlist.fulfilled, (state, action) => {
        // Update product's wishlist status if it exists in any array
        const productId = action.payload;
        const updateWishlistStatus = (products: Product[]) => {
          const product = products.find(p => p.id === productId);
          if (product) {
            product.favorites_count += 1;
          }
        };

        updateWishlistStatus(state.products);
        updateWishlistStatus(state.featuredProducts);
        updateWishlistStatus(state.recentProducts);
        updateWishlistStatus(state.searchResults);
        updateWishlistStatus(state.myProducts);

        if (state.selectedProduct?.id === productId) {
          state.selectedProduct.favorites_count += 1;
        }
      })
      
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const productId = action.payload;
        
        // Remove from wishlist array
        state.wishlist = state.wishlist.filter(p => p.id !== productId);
        
        // Update favorites count in other arrays
        const updateWishlistStatus = (products: Product[]) => {
          const product = products.find(p => p.id === productId);
          if (product) {
            product.favorites_count = Math.max(0, product.favorites_count - 1);
          }
        };

        updateWishlistStatus(state.products);
        updateWishlistStatus(state.featuredProducts);
        updateWishlistStatus(state.recentProducts);
        updateWishlistStatus(state.searchResults);
        updateWishlistStatus(state.myProducts);

        if (state.selectedProduct?.id === productId) {
          state.selectedProduct.favorites_count = Math.max(0, state.selectedProduct.favorites_count - 1);
        }
      })
      
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSearchFilters, 
  clearSearchResults, 
  setSelectedProduct, 
  updateProductInList 
} = productSlice.actions;

export default productSlice.reducer;