import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '../utils/products';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_KEY = 'guestCart';

const calculateTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.product._id === action.payload._id);
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { product: action.payload, quantity: 1 }];
      }
      return { items: newItems, ...calculateTotals(newItems) };

    case 'REMOVE_FROM_CART':
      newItems = state.items.filter(item => item.product._id !== action.payload);
      return { items: newItems, ...calculateTotals(newItems) };

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        newItems = state.items.filter(item => item.product._id !== action.payload.productId);
      } else {
        newItems = state.items.map(item =>
          item.product._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        );
      }
      return { items: newItems, ...calculateTotals(newItems) };

    case 'CLEAR_CART':
      return { items: [], totalItems: 0, totalPrice: 0 };

    case 'LOAD_CART':
      return { items: action.payload, ...calculateTotals(action.payload) };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  // Load cart from backend on auth
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        const raw = localStorage.getItem(GUEST_CART_KEY);
        if (!raw) {
          dispatch({ type: 'LOAD_CART', payload: [] });
          return;
        }
        try {
          const items = JSON.parse(raw) as CartItem[];
          dispatch({ type: 'LOAD_CART', payload: Array.isArray(items) ? items : [] });
        } catch {
          localStorage.removeItem(GUEST_CART_KEY);
          dispatch({ type: 'LOAD_CART', payload: [] });
        }
        return;
      }
      try {
        const res = await cartApi.get();
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    loadCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(state.items));
  }, [state.items, isAuthenticated]);

  const addToCart = (product: Product) => {
    if (!isAuthenticated) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
      return;
    }
    cartApi
      .add(product._id, 1)
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((error) => console.error('Failed to add to cart:', error));
  };

  const removeFromCart = (productId: string) => {
    if (!isAuthenticated) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      return;
    }
    cartApi
      .remove(productId)
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((error) => console.error('Failed to remove from cart:', error));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    cartApi
      .remove(productId)
      .then(() => cartApi.add(productId, quantity))
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((error) => console.error('Failed to update cart quantity:', error));
  };

  const clearCart = () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    cartApi
      .clear()
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((error) => console.error('Failed to clear cart:', error));
  };

  const isInCart = (productId: string) => {
    return state.items.some(item => item.product._id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
