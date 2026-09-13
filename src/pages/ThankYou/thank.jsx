import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MDBSpinner } from 'mdb-react-ui-kit';
import { getOrderRequest } from '../../services/orderService';
import formatPrice from '../../utils/formatPrice';
import './thank.css';

function Thank() {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const data = await getOrderRequest(orderId);
        if (!active) return;
        setOrder(data.order || null);
      } catch (requestError) {
        if (!active) return;
        setError(
          typeof requestError === 'string'
            ? requestError
            : 'No fue posible cargar la orden.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    loadOrder();
    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <MDBSpinner role="status" />
        <p className="mt-2">Cargando confirmación…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="thank-you">
        <div className="success-icon" aria-hidden="true">✓</div>
        <h1>¡Gracias!</h1>
        <p className="thank-message">Tu compra se realizó con éxito. ¡Apreciamos tu compra!</p>
        {error && <p className="text-danger">{error}</p>}
        <Link to="/" className="back-home">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="thank-you">
      <div className="success-icon" aria-hidden="true">✓</div>
      <h1>¡Gracias!</h1>
      <p className="thank-message">Tu compra se realizó con éxito. ¡Apreciamos tu compra!</p>
      <div className="order-meta">
        <p>
          <strong>Orden #{order.id}</strong>
        </p>
        <p>Total: {formatPrice(order.total)}</p>
        <p>
          Envío a: {order.shipping_name}, {order.shipping_address},{' '}
          {order.shipping_city}, {order.shipping_zip}, {order.shipping_phone}
        </p>
      </div>
      {order.items && order.items.length > 0 && (
        <div className="order-items">
          <h3>Productos</h3>
          {order.items.map((item) => (
            <div key={item.id} className="order-item">
              <span>
                {item.name} x{item.quantity} — {formatPrice(item.price)}{' '}
                c/u
              </span>
            </div>
          ))}
        </div>
      )}
      <Link to="/" className="back-home">
        Volver al inicio
      </Link>
    </div>
  );
}

export default Thank;
