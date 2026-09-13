import { describe, it, expect, vi, beforeEach } from 'vitest';
import cartReducer, {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearCartError,
} from '../../../features/cart/cartSlice';

const mockProduct = {
  id: 1,
  name: 'Watch 1',
  price: 100,
  description: 'Desc 1',
  image: 'img1.png',
  category: 'Diver',
};

describe('cartSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addToCart agrega item nuevo', () => {
    const state = cartReducer(
      undefined,
      addToCart({ ...mockProduct, productId: 1, quantity: 2 })
    );
    expect(state.items.length).toBe(1);
    expect(state.items[0].name).toBe('Watch 1');
    expect(state.items[0].quantity).toBe(2);
  });

  it('addToCart incrementa cantidad si existe', () => {
    const initialState = {
      items: [{ ...mockProduct, productId: 1, quantity: 1 }],
      status: 'idle',
      error: null,
    };
    const state = cartReducer(
      initialState,
      addToCart({ ...mockProduct, productId: 1, quantity: 2 })
    );
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('removeFromCart elimina item', () => {
    const initialState = {
      items: [{ ...mockProduct, productId: 1, quantity: 1 }],
      status: 'idle',
      error: null,
    };
    const state = cartReducer(initialState, removeFromCart(1));
    expect(state.items.length).toBe(0);
  });

  it('updateQuantity actualiza cantidad', () => {
    const initialState = {
      items: [{ ...mockProduct, productId: 1, quantity: 1 }],
      status: 'idle',
      error: null,
    };
    const state = cartReducer(
      initialState,
      updateQuantity({ id: 1, quantity: 5 })
    );
    expect(state.items[0].quantity).toBe(5);
  });

  it('clearCart vacia items', () => {
    const initialState = {
      items: [{ ...mockProduct, productId: 1, quantity: 1 }],
      status: 'idle',
      error: null,
    };
    const state = cartReducer(initialState, clearCart());
    expect(state.items.length).toBe(0);
  });

  it('clearCartError limpia error', () => {
    const initialState = {
      items: [],
      status: 'idle',
      error: 'some error',
    };
    const state = cartReducer(initialState, clearCartError());
    expect(state.error).toBeNull();
  });
});
