import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addCartItem, addToCart } from '../../features/cart/cartSlice';
import { MDBSpinner, MDBBtn } from 'mdb-react-ui-kit';
import { getProductRequest } from '../../services/productService';
import formatPrice from '../../utils/formatPrice';
import './ProductDetail.css';

function ProductDetail() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setAdded(false);
      try {
        const data = await getProductRequest(productId);
        if (!active) return;
        setProduct(data.product || null);
      } catch (requestError) {
        if (!active) return;
        setError(
          typeof requestError === 'string'
            ? requestError
            : 'No fue posible cargar el producto.'
        );
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  const stock = Number(product?.stock ?? 0);
  const isOutOfStock = stock <= 0;
  const maxQuantity = isOutOfStock ? 1 : stock;

  const handleAddToCart = async () => {
    setCartError('');
    try {
      if (isOutOfStock) {
        setCartError('Este producto está agotado.');
        return;
      }

      if (quantity > stock) {
        setCartError('La cantidad solicitada supera el stock disponible.');
        return;
      }

      if (user) {
        await dispatch(
          addCartItem({ productId: product.id, quantity })
        ).unwrap();
      } else {
        dispatch(addToCart({ ...product, quantity }));
      }
      setAdded(true);
    } catch (requestError) {
      setCartError(
        typeof requestError === 'string'
          ? requestError
          : 'No fue posible añadir el producto.'
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <MDBSpinner role="status" />
        <p className="mt-2">Cargando producto…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-5">
        <p className="text-danger">{error}</p>
        <Link to="/products" className="cta-button">
          Volver a productos
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center my-5">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o fue retirado.</p>
        <Link to="/products" className="cta-button">
          Volver a productos
        </Link>
      </div>
    );
  }

  const formattedPrice = formatPrice(product.price);

  return (
    <div className="product-detail-container">
      <div className="product-detail-card">
        <img
          src={product.image}
          alt={product.name}
          className="product-detail-image"
        />
        <div className="product-detail-info">
          <h2 className="product-name">{product.name}</h2>
          <p className="product-category">Categoría: {product.category}</p>
          <p className="product-description">{product.description}</p>
          <p className="product-price">{formattedPrice}</p>
          <p className="product-stock-status">
            {isOutOfStock ? 'Agotado' : 'Disponible'}
          </p>

          {!isOutOfStock && (
            <div className="quantity-controls-Product">
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= maxQuantity}
              >
                +
              </button>
            </div>
          )}

          <MDBBtn onClick={handleAddToCart} className="mt-3" disabled={isOutOfStock}>
            {isOutOfStock ? 'Agotado' : 'Añadir al carrito'}
          </MDBBtn>

          {cartError && <p className="text-danger mt-2">{cartError}</p>}
          {added && (
            <div className="mt-2">
              <MDBBtn color="success" onClick={() => navigate('/cart')}>
                Ir al carrito
              </MDBBtn>
            </div>
          )}
        </div>
      </div>
      <div className="text-center mt-4">
        <Link to="/products" className="cta-button">
          Volver a productos
        </Link>
      </div>
    </div>
  );
}

export default ProductDetail;
