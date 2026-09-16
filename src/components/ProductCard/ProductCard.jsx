import { useDispatch, useSelector } from 'react-redux';
import { addCartItem, addToCart } from '../../features/cart/cartSlice';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import formatPrice from '../../utils/formatPrice';
import './ProductCard.css';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const user = useSelector((state) => state.auth.user);

  const formattedPrice = formatPrice(product.price);
  const stock = Number(product.stock ?? 0);
  const isOutOfStock = stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      setError('Este producto está agotado.');
      return;
    }

    try {
      if (user) {
        await dispatch(
          addCartItem({
            productId: product.id,
            quantity: 1,
          })
        ).unwrap();
      } else {
        dispatch(
          addToCart({
            ...product,
            productId: product.id,
            quantity: 1,
          })
        );
      }

      setError('');
      setShowModal(true);
    } catch (requestError) {
      setError(
        typeof requestError === 'string'
          ? requestError
          : 'No fue posible añadir el producto.'
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const goToCart = () => {
    setShowModal(false);
    navigate('/cart');
  };

  const successModal = showModal
    ? createPortal(
        <div className="cart-success-overlay">
          <div
            className="cart-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-success-title"
          >
            <div className="cart-success-icon" aria-hidden="true">
              ✓
            </div>

            <h4 id="cart-success-title">
              ¡Producto añadido!
            </h4>

            <p className="cart-success-product">
              {product.name}
            </p>

            <p className="cart-success-message">
              Se añadió al carrito correctamente.
            </p>

            <div className="cart-success-actions">
              <button
                type="button"
                onClick={goToCart}
                className="go-to-cart-btn"
              >
                Ver carrito
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="close-modal-btn"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="product-card bg-image hover-zoom">
        <Link
          to={`/products/${product.id}`}
          className="product-link"
        >
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        </Link>

        <div className="product-info">
          <Link
            to={`/products/${product.id}`}
            className="product-link"
          >
            <h3 className="product-name">
              {product.name}
            </h3>
          </Link>

          <p className="product-description">
            {product.description}
          </p>

          <p className="product-price">
            {formattedPrice}
          </p>

          <p className="product-stock-status">
            {isOutOfStock ? 'Agotado' : 'Disponible'}
          </p>

          <button
            type="button"
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={isOutOfStock}
          >
            {isOutOfStock
              ? 'Agotado'
              : 'Añadir al carrito'}
          </button>

          {error && (
            <p className="product-card-error">
              {error}
            </p>
          )}
        </div>
      </div>

      {successModal}
    </>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,

    name: PropTypes.string.isRequired,

    price: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,

    description: PropTypes.string,

    image: PropTypes.string,

    category: PropTypes.string,

    stock: PropTypes.number,
  }).isRequired,
};

export default ProductCard;