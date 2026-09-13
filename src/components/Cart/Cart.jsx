import { useDispatch, useSelector } from 'react-redux';
import {
  removeCartItem,
  removeFromCart,
  updateCartItem,
  updateQuantity,
} from '../../features/cart/cartSlice';
import { useState } from 'react';
import { MDBRow, MDBCol, MDBBtn } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import formatPrice from '../../utils/formatPrice';
import './Cart.css';

function Cart() {
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRemoveFromCart = async (productId) => {
    try {
      if (user) {
        await dispatch(removeCartItem(productId)).unwrap();
      } else {
        dispatch(removeFromCart(productId));
      }
      setError('');
    } catch (requestError) {
      setError(
        typeof requestError === 'string'
          ? requestError
          : 'No fue posible eliminar el producto.'
      );
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }
    setError('');
    try {
      if (user) {
        await dispatch(updateCartItem({ productId, quantity })).unwrap();
      } else {
        dispatch(updateQuantity({ productId, quantity }));
      }
    } catch (requestError) {
      setError(
        typeof requestError === 'string'
          ? requestError
          : 'No fue posible actualizar el carrito.'
      );
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <MDBRow>
      <MDBCol md="8">
        <div className="cart">
          <h2>Tu carrito de compras</h2>
          {cartItems.length === 0 ? (
            <p>Tu carrito está vacío.</p>
          ) : (
            <div>
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div>
                    <p className="product-name">{item.name}</p>
                    <p className="product-price">
                      {formatPrice(item.price)} x {item.quantity} = {formatPrice(item.price * item.quantity)}
                    </p>
                    <p>{item.description}</p>
                    <br />
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <br />
                    <button
                      onClick={() => handleRemoveFromCart(item.productId)}
                      className="remove-btn"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {error && <p style={{ color: 'red' }}>{error}</p>}{' '}
            </div>
          )}
        </div>
      </MDBCol>
      <MDBCol md="4" className="sticky-cart">
        <h3 className="total">Total: {formatPrice(calculateTotal())}</h3>
        <MDBBtn onClick={handleCheckout} color="primary" block>
          Pagar
        </MDBBtn>
      </MDBCol>
    </MDBRow>
  );
}

export default Cart;
