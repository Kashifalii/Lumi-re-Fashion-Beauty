import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (userId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', userId);
    set({ items: data || [], loading: false });
  },

  addToWishlist: async (userId, productId) => {
    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: userId, product_id: productId });
    if (!error) {
      await get().fetchWishlist(userId);
    }
    return { error };
  },

  removeFromWishlist: async (userId, productId) => {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (!error) {
      set((state) => ({
        items: state.items.filter((i) => i.product_id !== productId),
      }));
    }
    return { error };
  },

  isWishlisted: (productId) =>
    get().items.some((i) => i.product_id === productId),

  clear: () => set({ items: [] }),
}));
