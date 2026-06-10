import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Hoodie } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (hoodie: Hoodie, size: string, color: string, colorHex: string, quantity?: number) => void;
  removeItem: (hoodieId: string, size: string, color: string) => void;
  updateQuantity: (hoodieId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (hoodie, size, color, colorHex, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.hoodie._id === hoodie._id && i.size === size && i.color === color
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.hoodie._id === hoodie._id && i.size === size && i.color === color
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { hoodie, size, color, colorHex, quantity }] };
        });
      },

      removeItem: (hoodieId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.hoodie._id === hoodieId && i.size === size && i.color === color)
          ),
        }));
      },

      updateQuantity: (hoodieId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(hoodieId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.hoodie._id === hoodieId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + (i.hoodie.discountPrice || i.hoodie.price) * i.quantity,
          0
        ),
    }),
    { name: 'hoodvault-cart' }
  )
);

export const generateTelegramMessage = (items: CartItem[], totalPrice: number, telegramUsername: string, user?: { name: string; email: string }): string => {
  const lines = items.map(
    (i) =>
      `• ${i.hoodie.name}\n  Size: ${i.size} | Color: ${i.color}\n  Qty: ${i.quantity} × ETB ${i.hoodie.discountPrice || i.hoodie.price} = ETB ${(i.hoodie.discountPrice || i.hoodie.price) * i.quantity}\n  Visual: ${i.hoodie.images[0]?.url || ''}`
  );
  
  const customerInfo = user ? `\n\n👤 Customer: ${user.name}\n📧 Email: ${user.email}` : '';
  
  return encodeURIComponent(
    `NEW ORDER FROM AXIS ARCHIVE\n\n${lines.join('\n\n')}${customerInfo}\n\n💰 Total: ETB ${totalPrice.toLocaleString()}\n\nPlease confirm the order.`
  );
};

export const openTelegramOrder = (items: CartItem[], totalPrice: number, telegramUsername: string, user?: { name: string; email: string }) => {
  const message = generateTelegramMessage(items, totalPrice, telegramUsername, user);
  window.open(`https://t.me/${telegramUsername}?text=${message}`, '_blank');
};
