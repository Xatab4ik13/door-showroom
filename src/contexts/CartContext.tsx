import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CatalogProduct } from '@/data/catalog';

export interface CartAccessory {
  article: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  product: CatalogProduct;
  quantity: number;
  selectedSize?: string;
  accessories: CartAccessory[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CatalogProduct, quantity?: number, selectedSize?: string, accessories?: CartAccessory[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'rusdoors_cart';

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate old format without accessories
    return parsed.map((item: any) => ({
      ...item,
      accessories: item.accessories || [],
    }));
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (
    product: CatalogProduct,
    quantity = 1,
    selectedSize?: string,
    accessories: CartAccessory[] = [],
  ) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing && accessories.length === 0) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      // If adding with accessories, always add as new item
      return [...prev, { product, quantity, selectedSize, accessories }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const totalPrice = items.reduce((sum, i) => {
    let itemTotal = i.product.price * i.quantity;
    i.accessories.forEach((a) => {
      itemTotal += a.price * a.quantity;
    });
    return sum + itemTotal;
  }, 0);

  const totalDiscount = items.reduce((sum, i) => {
    if (i.product.oldPrice) {
      return sum + (i.product.oldPrice - i.product.price) * i.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, totalDiscount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
