import { Timestamp } from '@angular/fire/firestore';

// ─────────────────────────────────────────────
// 1. USERS
// Collection: /users/{uid}
// ─────────────────────────────────────────────
export interface UserProfile {
  id: string;              // Firebase Auth UID
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  role?: 'admin' | 'customer';
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ─────────────────────────────────────────────
// 2. USER ADDRESSES
// Subcollection: /users/{uid}/addresses/{addressId}
// ─────────────────────────────────────────────
export interface UserAddress {
  id: string;
  user_id: string;
  recipient_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}

// ─────────────────────────────────────────────
// 3. CATEGORIES
// Collection: /categories/{categoryId}
// ─────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
}

// ─────────────────────────────────────────────
// 4. PRODUCTS
// Collection: /products/{productId}
// ─────────────────────────────────────────────
export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  is_published: boolean;
  created_at: Timestamp;
  // Denormalized fields for quick display (avoid extra reads)
  imageUrl: string;
  images: string[];
  badges: string[];
  rating: number;
  reviews: number;
}

// ─────────────────────────────────────────────
// 5. PRODUCT VARIANTS
// Subcollection: /products/{productId}/variants/{variantId}
// ─────────────────────────────────────────────
export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  title: string;        // e.g., "Size M / Blue"
  price_modifier: number; // Added to base_price
  stock_quantity: number;
  created_at: Timestamp;
}

// ─────────────────────────────────────────────
// 6. CARTS
// Collection: /carts/{uid}
// ─────────────────────────────────────────────
export interface Cart {
  id: string;           // = user uid
  user_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ─────────────────────────────────────────────
// 7. CART ITEMS
// Subcollection: /carts/{uid}/items/{itemId}
// ─────────────────────────────────────────────
export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  // Denormalized snapshot for display
  product_id: string;
  product_name: string;
  product_slug: string;
  variant_title: string;
  price_at_add: number;
  imageUrl: string;
}

// ─────────────────────────────────────────────
// 8. ORDERS
// Collection: /orders/{orderId}
// ─────────────────────────────────────────────
export interface Order {
  id: string;
  user_id: string;
  shipping_name: string;
  shipping_address: string;
  billing_name: string;
  billing_address: string;
  subtotal: number;
  shipping_fee: number;
  tax_fee: number;
  total_amount: number;
  order_status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: Timestamp;
}

// ─────────────────────────────────────────────
// 9. ORDER ITEMS
// Subcollection: /orders/{orderId}/items/{itemId}
// ─────────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  // Denormalized snapshot
  product_name: string;
  variant_title: string;
  imageUrl: string;
}

// ─────────────────────────────────────────────
// 10. PAYMENTS
// Subcollection: /orders/{orderId}/payment (single doc)
// ─────────────────────────────────────────────
export interface Payment {
  id: string;
  order_id: string;
  gateway_name: 'Stripe' | 'PayPal';
  transaction_id: string;
  payment_status: 'Pending' | 'Succeeded' | 'Failed' | 'Refunded';
  amount: number;
  created_at: Timestamp;
}

// ─────────────────────────────────────────────
// 11. PRODUCT REVIEWS
// Subcollection: /products/{productId}/reviews/{reviewId}
// ─────────────────────────────────────────────
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: Timestamp;
}
