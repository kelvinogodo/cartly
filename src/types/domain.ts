import type { Database } from './supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type CartItemRow = Database['public']['Tables']['cart_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}
