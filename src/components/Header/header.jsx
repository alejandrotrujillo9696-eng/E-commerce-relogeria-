import { useEffect } from 'react';
import { useState } from 'react';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBNavbarNav,
  MDBNavbarLink,
  MDBBadge,
  MDBIcon,
  MDBCollapse,
  MDBNavbarItem,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from 'mdb-react-ui-kit';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { clearCart } from '../../features/cart/cartSlice';
import logo from '../../assets/logo.jpg';
import './header.css';
function Header() {
  const [openNav, setOpenNav] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items || []);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(clearCart());
    navigate('/');
  };

  return (
    <MDBNavbar light bgColor="light" expand="lg" className={`sticky-navbar${isHidden ? " header-hidden" : ""}`}>
      <MDBContainer fluid>
        <MDBNavbarBrand>
          <img
            src={logo}
            height="50"
            alt="Logo"
            loading="lazy"
          />
        </MDBNavbarBrand>
        <div className="header-drop-down">
          <MDBNavbarItem className="d-flex ml-auto mb-3">
            <MDBNavbarLink
              onClick={handleCartClick}
              style={{ cursor: 'pointer' }}
              className="cart-nav-link"
            >
              <MDBBadge pill color="danger">
                {cartItemCount || 0}
              </MDBBadge>
              <span>
                <MDBIcon fas icon="shopping-cart" className="cart-icon" />
              </span>
            </MDBNavbarLink>
          </MDBNavbarItem>

          <MDBNavbarItem className="d-flex LoginPerson mb-3 ml-3">
            <MDBDropdown>
              <MDBDropdownToggle tag="a" className="nav-link user-dropdown-toggle" role="button">
                <MDBIcon far icon="user-circle" size="2x" className="user-icon" />
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                {user ? (
                  <>
                    <MDBDropdownItem link>
                      {user.email || `${user.firstName} ${user.lastName}`}
                    </MDBDropdownItem>
                    <MDBDropdownItem link onClick={handleLogout}>
                      Cerrar sesión
                    </MDBDropdownItem>
                  </>
                ) : (
                  <MDBDropdownItem link onClick={() => navigate('/login')}>
                    Iniciar sesión
                  </MDBDropdownItem>
                )}
              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBNavbarItem>
        </div>

        <MDBNavbarToggler
          type="button"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={() => setOpenNav(!openNav)}
        >
          <MDBIcon className="header-MDBNavbarToggler" icon="bars" fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar open={openNav} style={{ fontSize: '15px' }}>
          <MDBNavbarNav>
            <MDBNavbarItem>
              <MDBNavbarLink
                tag={Link}
                to="/"
                active={location.pathname === '/'}
                aria-current="page"
                className={location.pathname === '/' ? 'active' : ''}
              >
                Inicio
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink
                tag={Link}
                to="/products"
                className={location.pathname === '/products' ? 'active' : ''}
              >
                Productos
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink
                tag={Link}
                to="/cart"
                className={location.pathname === '/cart' ? 'active' : ''}
              >
                Carrito
              </MDBNavbarLink>
            </MDBNavbarItem>
            {user?.role === 'admin' && (
              <MDBNavbarItem>
                <MDBNavbarLink
                  tag={Link}
                  to="/admin"
                  className={
                    location.pathname.startsWith('/admin') ? 'active' : ''
                  }
                >
                  Admin
                </MDBNavbarLink>
              </MDBNavbarItem>
            )}
            {user && (
              <MDBNavbarItem>
                <MDBNavbarLink
                  tag={Link}
                  to="/orders"
                  className={location.pathname === '/orders' ? 'active' : ''}
                >
                  Mis pedidos
                </MDBNavbarLink>
              </MDBNavbarItem>
            )}
          </MDBNavbarNav>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
}

export default Header;
