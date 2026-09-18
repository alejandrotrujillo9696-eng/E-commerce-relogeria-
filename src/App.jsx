import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword';
import ProductList from './pages/Product/ProductList';
import ProductDetail from './pages/Product/ProductDetail';
import CheckoutPage from './pages/Checkout/Checkout';
import CartPage from './pages/Cart/CartPage';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home/Home';
import NotFound from './components/404Page/NotFound';
import Header from './components/Header/header';
import Footer from './components/Footer/footer';
import Thank from './pages/ThankYou/thank';
import Admin from './pages/Admin/Admin';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminCategories from './pages/Admin/Categories';
import AdminOrders from './pages/Admin/Orders';
import AdminUsers from './pages/Admin/Users';
import UserOrders from './pages/User/UserOrders';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentUser } from './features/auth/authSlice';
import { loadCart, mergeGuestCart } from './features/cart/cartSlice';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const initialized = useSelector((state) => state.auth.initialized);

  useEffect(() => {
    dispatch(loadCurrentUser());
  }, [dispatch]);

  const mergeDoneRef = useRef(false);
  const cartLoadStartedRef = useRef(false);

  useEffect(() => {
    if (!initialized || !user) {
      mergeDoneRef.current = false;
      cartLoadStartedRef.current = false;
      return;
    }

    if (!mergeDoneRef.current) {
      const guestItems = (JSON.parse(localStorage.getItem('cartItems')) || []).map(
        (item) => ({
          ...item,
          productId: item.id,
        })
      );

      if (guestItems.length > 0) {
        mergeDoneRef.current = true;
        dispatch(mergeGuestCart(guestItems));
        return;
      }
    }

    if (!cartLoadStartedRef.current) {
      cartLoadStartedRef.current = true;
      dispatch(loadCart());
    }
  }, [dispatch, initialized, user]);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={initialized && user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={initialized && user ? <Navigate to="/" /> : <Register />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/thank-you" element={<Thank />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <UserOrders />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </Router>
  );
}

export default App;
