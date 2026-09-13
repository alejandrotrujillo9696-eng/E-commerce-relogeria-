import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addCartItemRequest,
  getCartRequest,
  mergeGuestCartRequest,
  removeCartItemRequest,
  updateCartItemRequest,
} from '../../services/cartService';

const getGuestCart = () => {
  try {
    return (JSON.parse(localStorage.getItem('cartItems')) || []).map(
      (item) => ({
        ...item,
        productId: item.id,
      })
    );
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem('cartItems', JSON.stringify(items));
};

const createCartThunk = (type, request) =>
  createAsyncThunk(type, async (payload, { rejectWithValue }) => {
    try {
      return await request(payload);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const loadCart = createCartThunk('cart/load', getCartRequest);
export const addCartItem = createCartThunk('cart/addItem', addCartItemRequest);
export const updateCartItem = createCartThunk(
  'cart/updateItem',
  updateCartItemRequest
);
export const removeCartItem = createCartThunk(
  'cart/removeItem',
  removeCartItemRequest
);
export const mergeGuestCart = createCartThunk(
  'cart/mergeGuestCart',
  mergeGuestCartRequest
);

const initialState = {
  items: getGuestCart(),
  status: 'idle',
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const productId = action.payload.productId || action.payload.id;
      const existingItem = state.items.find(
        (item) => item.productId === productId || item.id === productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          ...action.payload,
          productId,
          quantity: action.payload.quantity,
        });
      }
      saveGuestCart(state.items);
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => (item.productId || item.id) !== productId
      );
      saveGuestCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(
        (item) => (item.productId || item.id) === id
      );
      if (item && quantity >= 1) {
        item.quantity = quantity;
        saveGuestCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) =>
          action.type.endsWith('/pending') && action.type.startsWith('cart/'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith('/fulfilled') && action.type.startsWith('cart/'),
        (state, action) => {
          state.items = (action.payload.items || []).map((item) => ({
            ...item,
            productId: item.id,
          }));
          state.status = 'idle';
          state.error = null;

          if (action.type === mergeGuestCart.fulfilled.type) {
            localStorage.removeItem('cartItems');
          }
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith('/rejected') && action.type.startsWith('cart/'),
        (state, action) => {
          state.status = 'idle';
          state.error =
            action.payload || 'No fue posible actualizar el carrito.';
        }
      );
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
