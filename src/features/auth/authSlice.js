import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '../../services/authService';
import { clearApiAuthToken, setApiAuthToken } from '../../services/apiClient';

const createRequestThunk = (type, request) =>
  createAsyncThunk(type, async (payload, { rejectWithValue }) => {
    try {
      return await request(payload);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const register = createRequestThunk('auth/register', registerRequest);
export const login = createRequestThunk('auth/login', loginRequest);
export const logout = createRequestThunk('auth/logout', logoutRequest);
export const loadCurrentUser = createRequestThunk(
  'auth/loadCurrentUser',
  getCurrentUserRequest
);

const initialState = {
  user: null,
  token: null,
  initialized: false,
  status: 'idle',
  error: null,
  initializationRequestId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCurrentUser.pending, (state, action) => {
        state.status = 'loading';
        state.initializationRequestId = action.meta.requestId;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        if (
          state.initializationRequestId &&
          state.initializationRequestId !== action.meta.requestId
        ) {
          return;
        }
        state.user = action.payload.user;
        state.initialized = true;
        state.status = 'idle';
        state.initializationRequestId = null;
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        if (
          state.initializationRequestId &&
          state.initializationRequestId !== action.meta.requestId
        ) {
          return;
        }
        state.user = null;
        state.initialized = true;
        state.status = 'idle';
        state.initializationRequestId = null;
        clearApiAuthToken();
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        clearApiAuthToken();
        state.status = 'idle';
        state.initializationRequestId = null;
      })
      .addMatcher(
        (action) =>
          action.type === register.fulfilled.type ||
          action.type === login.fulfilled.type,
        (state, action) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
          setApiAuthToken(action.payload.token);
          state.initialized = true;
          state.initializationRequestId = 'superseded-by-login';
          state.status = 'idle';
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type === register.pending.type ||
          action.type === login.pending.type,
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type === register.rejected.type ||
          action.type === login.rejected.type,
        (state, action) => {
          state.status = 'idle';
          state.error =
            action.payload || 'No fue posible completar la autenticación.';
        }
      );
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
