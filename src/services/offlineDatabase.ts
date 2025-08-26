import SQLite from 'react-native-sqlite-2';
import { Product, User, Order, CartItem, Notification } from '../models';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'product' | 'order' | 'cart' | 'user' | 'wishlist' | 'review';
  entityId: string;
  data: any;
  timestamp: number;
  synced: boolean;
  retry_count: number;
}

export interface CachedData {
  id: string;
  entity: string;
  data: string; // JSON stringified
  last_updated: number;
  expires_at?: number;
}

export class OfflineDatabase {
  private static instance: OfflineDatabase;
  private db: SQLite.Database | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OfflineDatabase {
    if (!OfflineDatabase.instance) {
      OfflineDatabase.instance = new OfflineDatabase();
    }
    return OfflineDatabase.instance;
  }

  /**
   * Initialize the SQLite database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = SQLite.openDatabase('kamer_offline.db', '1.0', 'Kamer Vide Grenier Offline DB', 200000);
      
      await this.createTables();
      this.isInitialized = true;
      console.log('✅ Offline database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize offline database:', error);
      throw error;
    }
  }

  /**
   * Create all necessary tables
   */
  private async createTables(): Promise<void> {
    const queries = [
      // Offline actions queue table
      `CREATE TABLE IF NOT EXISTS offline_actions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0
      )`,

      // Cached products table
      `CREATE TABLE IF NOT EXISTS cached_products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'XAF',
        seller_id TEXT,
        category_id TEXT,
        images TEXT,
        location TEXT,
        city TEXT,
        region TEXT,
        status TEXT,
        is_featured INTEGER DEFAULT 0,
        created_at INTEGER,
        last_updated INTEGER NOT NULL,
        expires_at INTEGER
      )`,

      // Cached orders table
      `CREATE TABLE IF NOT EXISTS cached_orders (
        id TEXT PRIMARY KEY,
        order_number TEXT,
        buyer_id TEXT,
        seller_id TEXT,
        total_amount REAL,
        currency TEXT DEFAULT 'XAF',
        status TEXT,
        payment_status TEXT,
        payment_method TEXT,
        created_at INTEGER,
        last_updated INTEGER NOT NULL,
        data TEXT NOT NULL
      )`,

      // Cached user data table
      `CREATE TABLE IF NOT EXISTS cached_users (
        id TEXT PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        avatar_url TEXT,
        city TEXT,
        region TEXT,
        role TEXT,
        last_updated INTEGER NOT NULL,
        data TEXT NOT NULL
      )`,

      // Cart items table (for offline cart management)
      `CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        added_at INTEGER NOT NULL,
        last_updated INTEGER NOT NULL
      )`,

      // Wishlist items table
      `CREATE TABLE IF NOT EXISTS wishlist_items (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        added_at INTEGER NOT NULL
      )`,

      // Notifications cache table
      `CREATE TABLE IF NOT EXISTS cached_notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        last_updated INTEGER NOT NULL
      )`,

      // App analytics and usage data
      `CREATE TABLE IF NOT EXISTS app_analytics (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        event_data TEXT,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0
      )`,

      // Search history table
      `CREATE TABLE IF NOT EXISTS search_history (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        filters TEXT,
        timestamp INTEGER NOT NULL,
        result_count INTEGER DEFAULT 0
      )`,

      // Recently viewed products
      `CREATE TABLE IF NOT EXISTS recently_viewed (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        viewed_at INTEGER NOT NULL
      )`
    ];

    for (const query of queries) {
      await this.executeQuery(query);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_offline_actions_synced ON offline_actions(synced)',
      'CREATE INDEX IF NOT EXISTS idx_offline_actions_timestamp ON offline_actions(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_cached_products_category ON cached_products(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_cached_products_seller ON cached_products(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_cached_products_location ON cached_products(city, region)',
      'CREATE INDEX IF NOT EXISTS idx_cached_orders_user ON cached_orders(buyer_id)',
      'CREATE INDEX IF NOT EXISTS idx_cached_orders_seller ON cached_orders(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_recently_viewed_timestamp ON recently_viewed(viewed_at)'
    ];

    for (const indexQuery of indexes) {
      await this.executeQuery(indexQuery);
    }
  }

  /**
   * Execute a SQL query
   */
  private executeQuery(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          query,
          params,
          (tx, result) => resolve(result),
          (tx, error) => {
            console.error('SQL Error:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // ========== OFFLINE ACTIONS QUEUE ==========

  /**
   * Add an action to the offline queue
   */
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced' | 'retry_count'>): Promise<void> {
    const actionData: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false,
      retry_count: 0,
    };

    await this.executeQuery(
      `INSERT INTO offline_actions (id, type, entity, entity_id, data, timestamp, synced, retry_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actionData.id,
        actionData.type,
        actionData.entity,
        actionData.entityId,
        JSON.stringify(actionData.data),
        actionData.timestamp,
        actionData.synced ? 1 : 0,
        actionData.retry_count,
      ]
    );
  }

  /**
   * Get all pending offline actions
   */
  async getPendingOfflineActions(): Promise<OfflineAction[]> {
    const result = await this.executeQuery(
      'SELECT * FROM offline_actions WHERE synced = 0 ORDER BY timestamp ASC'
    );

    return result.rows._array.map((row: any) => ({
      id: row.id,
      type: row.type,
      entity: row.entity,
      entityId: row.entity_id,
      data: JSON.parse(row.data),
      timestamp: row.timestamp,
      synced: row.synced === 1,
      retry_count: row.retry_count,
    }));
  }

  /**
   * Mark an offline action as synced
   */
  async markActionAsSynced(actionId: string): Promise<void> {
    await this.executeQuery(
      'UPDATE offline_actions SET synced = 1 WHERE id = ?',
      [actionId]
    );
  }

  /**
   * Increment retry count for an action
   */
  async incrementActionRetryCount(actionId: string): Promise<void> {
    await this.executeQuery(
      'UPDATE offline_actions SET retry_count = retry_count + 1 WHERE id = ?',
      [actionId]
    );
  }

  /**
   * Remove an offline action
   */
  async removeOfflineAction(actionId: string): Promise<void> {
    await this.executeQuery('DELETE FROM offline_actions WHERE id = ?', [actionId]);
  }

  /**
   * Clear all synced actions older than specified days
   */
  async clearOldSyncedActions(daysOld: number = 7): Promise<void> {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    await this.executeQuery(
      'DELETE FROM offline_actions WHERE synced = 1 AND timestamp < ?',
      [cutoffTime]
    );
  }

  // ========== PRODUCT CACHING ==========

  /**
   * Cache products locally
   */
  async cacheProducts(products: Product[], expiresInHours: number = 24): Promise<void> {
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
    const lastUpdated = Date.now();

    for (const product of products) {
      await this.executeQuery(
        `INSERT OR REPLACE INTO cached_products 
         (id, title, description, price, currency, seller_id, category_id, images, 
          location, city, region, status, is_featured, created_at, last_updated, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.title,
          product.description,
          product.price,
          product.currency,
          product.seller_id,
          product.category_id,
          JSON.stringify(product.images),
          product.location,
          product.city,
          product.region,
          product.status,
          product.is_featured ? 1 : 0,
          new Date(product.created_at).getTime(),
          lastUpdated,
          expiresAt,
        ]
      );
    }
  }

  /**
   * Get cached products
   */
  async getCachedProducts(filters: {
    category_id?: string;
    seller_id?: string;
    city?: string;
    region?: string;
    is_featured?: boolean;
    limit?: number;
  } = {}): Promise<Product[]> {
    let query = 'SELECT * FROM cached_products WHERE expires_at > ?';
    const params: any[] = [Date.now()];

    if (filters.category_id) {
      query += ' AND category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.seller_id) {
      query += ' AND seller_id = ?';
      params.push(filters.seller_id);
    }

    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }

    if (filters.region) {
      query += ' AND region = ?';
      params.push(filters.region);
    }

    if (filters.is_featured !== undefined) {
      query += ' AND is_featured = ?';
      params.push(filters.is_featured ? 1 : 0);
    }

    query += ' ORDER BY last_updated DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const result = await this.executeQuery(query, params);

    return result.rows._array.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      currency: row.currency,
      seller_id: row.seller_id,
      category_id: row.category_id,
      images: JSON.parse(row.images || '[]'),
      location: row.location,
      city: row.city,
      region: row.region,
      status: row.status,
      is_featured: row.is_featured === 1,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.last_updated),
      // Add other product fields as needed
    })) as Product[];
  }

  /**
   * Search cached products
   */
  async searchCachedProducts(query: string, limit: number = 20): Promise<Product[]> {
    const searchQuery = `
      SELECT * FROM cached_products 
      WHERE expires_at > ? AND (
        title LIKE ? OR 
        description LIKE ? OR 
        city LIKE ? OR 
        region LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1
          WHEN description LIKE ? THEN 2
          ELSE 3
        END,
        last_updated DESC
      LIMIT ?
    `;

    const searchTerm = `%${query}%`;
    const exactTerm = `${query}%`;
    
    const result = await this.executeQuery(searchQuery, [
      Date.now(),
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      exactTerm,
      exactTerm,
      limit,
    ]);

    return result.rows._array.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      currency: row.currency,
      seller_id: row.seller_id,
      category_id: row.category_id,
      images: JSON.parse(row.images || '[]'),
      location: row.location,
      city: row.city,
      region: row.region,
      status: row.status,
      is_featured: row.is_featured === 1,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.last_updated),
    })) as Product[];
  }

  // ========== CART MANAGEMENT ==========

  /**
   * Add item to offline cart
   */
  async addToOfflineCart(item: Omit<CartItem, 'id' | 'created_at'>): Promise<void> {
    const cartItem = {
      ...item,
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      added_at: Date.now(),
      last_updated: Date.now(),
    };

    // Check if item already exists
    const existing = await this.executeQuery(
      'SELECT * FROM cart_items WHERE product_id = ?',
      [item.product_id]
    );

    if (existing.rows.length > 0) {
      // Update existing item
      await this.executeQuery(
        'UPDATE cart_items SET quantity = ?, total_price = ?, last_updated = ? WHERE product_id = ?',
        [item.quantity, item.total_price, cartItem.last_updated, item.product_id]
      );
    } else {
      // Insert new item
      await this.executeQuery(
        `INSERT INTO cart_items (id, product_id, quantity, unit_price, total_price, added_at, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cartItem.id,
          cartItem.product_id,
          cartItem.quantity,
          cartItem.unit_price,
          cartItem.total_price,
          cartItem.added_at,
          cartItem.last_updated,
        ]
      );
    }
  }

  /**
   * Get offline cart items
   */
  async getOfflineCartItems(): Promise<CartItem[]> {
    const result = await this.executeQuery(
      'SELECT * FROM cart_items ORDER BY added_at DESC'
    );

    return result.rows._array.map((row: any) => ({
      id: row.id,
      cart_id: 'offline_cart',
      product_id: row.product_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      total_price: row.total_price,
      created_at: new Date(row.added_at),
    }));
  }

  /**
   * Remove item from offline cart
   */
  async removeFromOfflineCart(productId: string): Promise<void> {
    await this.executeQuery('DELETE FROM cart_items WHERE product_id = ?', [productId]);
  }

  /**
   * Clear offline cart
   */
  async clearOfflineCart(): Promise<void> {
    await this.executeQuery('DELETE FROM cart_items');
  }

  // ========== ANALYTICS ==========

  /**
   * Track app analytics event
   */
  async trackEvent(eventType: string, eventData: any = {}): Promise<void> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.executeQuery(
      'INSERT INTO app_analytics (id, event_type, event_data, timestamp, synced) VALUES (?, ?, ?, ?, ?)',
      [eventId, eventType, JSON.stringify(eventData), Date.now(), 0]
    );
  }

  /**
   * Get pending analytics events
   */
  async getPendingAnalyticsEvents(): Promise<any[]> {
    const result = await this.executeQuery(
      'SELECT * FROM app_analytics WHERE synced = 0 ORDER BY timestamp ASC'
    );

    return result.rows._array.map((row: any) => ({
      id: row.id,
      event_type: row.event_type,
      event_data: JSON.parse(row.event_data || '{}'),
      timestamp: row.timestamp,
    }));
  }

  /**
   * Mark analytics events as synced
   */
  async markAnalyticsEventsSynced(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;

    const placeholders = eventIds.map(() => '?').join(',');
    await this.executeQuery(
      `UPDATE app_analytics SET synced = 1 WHERE id IN (${placeholders})`,
      eventIds
    );
  }

  // ========== SEARCH HISTORY ==========

  /**
   * Add search query to history
   */
  async addToSearchHistory(query: string, filters: any = {}, resultCount: number = 0): Promise<void> {
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Remove duplicate searches
    await this.executeQuery('DELETE FROM search_history WHERE query = ?', [query]);
    
    await this.executeQuery(
      'INSERT INTO search_history (id, query, filters, timestamp, result_count) VALUES (?, ?, ?, ?, ?)',
      [searchId, query, JSON.stringify(filters), Date.now(), resultCount]
    );

    // Keep only recent 50 searches
    await this.executeQuery(
      'DELETE FROM search_history WHERE id NOT IN (SELECT id FROM search_history ORDER BY timestamp DESC LIMIT 50)'
    );
  }

  /**
   * Get search history
   */
  async getSearchHistory(limit: number = 20): Promise<any[]> {
    const result = await this.executeQuery(
      'SELECT * FROM search_history ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );

    return result.rows._array.map((row: any) => ({
      id: row.id,
      query: row.query,
      filters: JSON.parse(row.filters || '{}'),
      timestamp: row.timestamp,
      result_count: row.result_count,
    }));
  }

  // ========== RECENTLY VIEWED ==========

  /**
   * Add product to recently viewed
   */
  async addToRecentlyViewed(productId: string): Promise<void> {
    // Remove if already exists
    await this.executeQuery('DELETE FROM recently_viewed WHERE product_id = ?', [productId]);
    
    const viewId = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.executeQuery(
      'INSERT INTO recently_viewed (id, product_id, viewed_at) VALUES (?, ?, ?)',
      [viewId, productId, Date.now()]
    );

    // Keep only recent 50 viewed products
    await this.executeQuery(
      'DELETE FROM recently_viewed WHERE id NOT IN (SELECT id FROM recently_viewed ORDER BY viewed_at DESC LIMIT 50)'
    );
  }

  /**
   * Get recently viewed products
   */
  async getRecentlyViewedProducts(limit: number = 20): Promise<string[]> {
    const result = await this.executeQuery(
      'SELECT product_id FROM recently_viewed ORDER BY viewed_at DESC LIMIT ?',
      [limit]
    );

    return result.rows._array.map((row: any) => row.product_id);
  }

  // ========== DATABASE MAINTENANCE ==========

  /**
   * Clear expired cache data
   */
  async clearExpiredData(): Promise<void> {
    const now = Date.now();
    
    // Clear expired products
    await this.executeQuery('DELETE FROM cached_products WHERE expires_at < ?', [now]);
    
    // Clear old search history (older than 30 days)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    await this.executeQuery('DELETE FROM search_history WHERE timestamp < ?', [thirtyDaysAgo]);
    
    // Clear old recently viewed (older than 7 days)
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    await this.executeQuery('DELETE FROM recently_viewed WHERE viewed_at < ?', [sevenDaysAgo]);
    
    // Clear old synced offline actions
    await this.clearOldSyncedActions();
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    pendingActions: number;
    cachedProducts: number;
    cartItems: number;
    searchHistory: number;
    recentlyViewed: number;
    analyticsEvents: number;
  }> {
    const stats = {
      pendingActions: 0,
      cachedProducts: 0,
      cartItems: 0,
      searchHistory: 0,
      recentlyViewed: 0,
      analyticsEvents: 0,
    };

    try {
      const queries = [
        'SELECT COUNT(*) as count FROM offline_actions WHERE synced = 0',
        'SELECT COUNT(*) as count FROM cached_products WHERE expires_at > ?',
        'SELECT COUNT(*) as count FROM cart_items',
        'SELECT COUNT(*) as count FROM search_history',
        'SELECT COUNT(*) as count FROM recently_viewed',
        'SELECT COUNT(*) as count FROM app_analytics WHERE synced = 0',
      ];

      const results = await Promise.all([
        this.executeQuery(queries[0]),
        this.executeQuery(queries[1], [Date.now()]),
        this.executeQuery(queries[2]),
        this.executeQuery(queries[3]),
        this.executeQuery(queries[4]),
        this.executeQuery(queries[5]),
      ]);

      stats.pendingActions = results[0].rows._array[0].count;
      stats.cachedProducts = results[1].rows._array[0].count;
      stats.cartItems = results[2].rows._array[0].count;
      stats.searchHistory = results[3].rows._array[0].count;
      stats.recentlyViewed = results[4].rows._array[0].count;
      stats.analyticsEvents = results[5].rows._array[0].count;
    } catch (error) {
      console.error('Failed to get database stats:', error);
    }

    return stats;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      // SQLite-2 doesn't have explicit close method, it's handled automatically
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export const offlineDatabase = OfflineDatabase.getInstance();