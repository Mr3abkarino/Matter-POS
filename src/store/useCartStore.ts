import { create } from 'zustand';
import { CartItem, Product, ProductSize, OrderType } from '../types';

interface CartState {
  cart: CartItem[];
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  selectedZoneFee: number;
  selectedZoneName: string;
  
  // Actions
  addToCart: (product: Product, size?: ProductSize, isStuffedCrust?: boolean) => void;
  removeFromCart: (itemKey: string) => void;
  updateQty: (itemKey: string, delta: number) => void;
  setOrderType: (type: OrderType) => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setDeliveryZone: (name: string, fee: number) => void;
  clearCart: () => void;
  
  // Computed Getters
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  orderType: 'takeaway',
  customerName: '',
  customerPhone: '',
  selectedZoneFee: 0,
  selectedZoneName: '',

  addToCart: (product, size, isStuffedCrust = false) => {
    let crustPrice = 0;
    let crustLabel = '';

    if (product.catId === 'البيتزا' && isStuffedCrust) {
      const sizeId = size ? size.id : 'sm';
      crustPrice = sizeId === 'sm' ? 25 : sizeId === 'md' ? 30 : 35;
      crustLabel = ` + حشو أطراف (+${crustPrice}ج)`;
    }

    const baseUnitPrice = size ? size.price : product.price;
    const finalUnitPrice = baseUnitPrice + crustPrice;
    const itemKey = `${product.id}-${size ? size.id : 'def'}-${isStuffedCrust ? 'stuffed' : 'normal'}`;

    set((state) => {
      const existingIndex = state.cart.findIndex((i) => i.itemKey === itemKey);
      if (existingIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingIndex].qty += 1;
        return { cart: updatedCart };
      }

      const newItem: CartItem = {
        itemKey,
        productId: product.id!,
        name: `${product.name}${crustLabel}`,
        unitPrice: finalUnitPrice,
        qty: 1,
        sizeName: size?.name,
        isStuffedCrust,
        emoji: product.emoji,
        imageUrl: product.imageUrl,
      };

      return { cart: [...state.cart, newItem] };
    });
  },

  removeFromCart: (itemKey) => {
    set((state) => ({ cart: state.cart.filter((i) => i.itemKey !== itemKey) }));
  },

  updateQty: (itemKey, delta) => {
    set((state) => ({
      cart: state.cart
        .map((i) => {
          if (i.itemKey === itemKey) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[],
    }));
  },

  setOrderType: (type) => set({ orderType: type }),
  setCustomerInfo: (name, phone) => set({ customerName: name, customerPhone: phone }),
  setDeliveryZone: (name, fee) => set({ selectedZoneName: name, selectedZoneFee: fee }),
  clearCart: () => set({ cart: [], customerName: '', customerPhone: '' }),

  getSubtotal: () => get().cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const delivery = get().orderType === 'delivery' ? get().selectedZoneFee : 0;
    return subtotal + delivery;
  },
}));
