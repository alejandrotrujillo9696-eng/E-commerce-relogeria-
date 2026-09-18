import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBInput,
} from 'mdb-react-ui-kit';
import { createOrderRequest } from '../../services/orderService';
import { diagnosticLog, resetDiagnosticLog } from '../../services/apiClient';
import { clearCart } from '../../features/cart/cartSlice';
import formatPrice from '../../utils/formatPrice';
import './Checkout.css';

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const [form, setForm] = useState({
    shippingName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingZip: '',
    shippingPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [diagnosticVisible] = useState(true);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    resetDiagnosticLog();
    diagnosticLog.push({ step: 'handleSubmit', status: 'iniciado', error: null });
    diagnosticLog.push({ step: 'cartItems.length', status: String(cartItems.length), error: null });
    diagnosticLog.push({ step: 'createOrderRequest', status: 'llamado', error: null });
    try {
      const data = await createOrderRequest(form);
      diagnosticLog.push({ step: 'createOrderRequest', status: 'completado', error: null });
      dispatch(clearCart());
      navigate('/thank-you', { state: { orderId: data.order.id } });
    } catch (err) {
      diagnosticLog.push({ step: 'createOrderRequest', status: 'error', error: { name: err?.name, message: err?.message || err } });
      setError(
        typeof err === 'string' ? err : 'No fue posible crear la orden.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !loading) {
    return (
      <MDBContainer className="my-5 text-center">
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos antes de continuar con la compra.</p>
        <button className="cta-button" onClick={() => navigate('/products')}>
          Ver productos
        </button>
      </MDBContainer>
    );
  }

  const checkoutContent = (
    <MDBContainer className="my-5">
      <MDBRow>
        <MDBCol md="7">
          <h2>Información de envio  |  Pago contraentrega</h2>
          <p className="payment-method-subtitle">Pagas en la puerta de tu casa.</p>
          <form onSubmit={handleSubmit}>
            <MDBInput
              label="Nombre completo"
              value={form.shippingName}
              onChange={handleChange('shippingName')}
              required
            />
            <MDBInput
              label="Dirección"
              value={form.shippingAddress}
              onChange={handleChange('shippingAddress')}
              required
            />
            <MDBRow>
              <MDBCol md="6">
                <MDBInput
                  label="Ciudad"
                  value={form.shippingCity}
                  onChange={handleChange('shippingCity')}
                  required
                />
              </MDBCol>
              <MDBCol md="6">
                <MDBInput
                  label="Código postal"
                  value={form.shippingZip}
                  onChange={handleChange('shippingZip')}
                  required
                />
              </MDBCol>
            </MDBRow>
            <MDBInput
              label="Teléfono"
              value={form.shippingPhone}
              onChange={handleChange('shippingPhone')}
              required
            />
            {error && <p className="text-danger">{error}</p>}
            <MDBBtn type="submit" disabled={loading || cartItems.length === 0}>
              {loading ? 'Procesando...' : 'Confirmar compra'}
            </MDBBtn>
            {diagnosticVisible && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '0.5rem',
                background: '#f7f7f7',
                fontSize: '0.8rem',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                <strong>DIAGNÓSTICO TEMPORAL</strong>
                {diagnosticLog.map((item, index) => {
                  const statusText = item.error
                    ? `ERROR: ${item.error.name} - ${item.error.message}`
                    : item.status;
                  return `${index + 1}. ${item.step}: ${statusText}\n`;
                }).join('')}
              </div>
            )}
          </form>
        </MDBCol>
        <MDBCol md="5">
          <h3>Resumen del pedido</h3>
          {cartItems.map((item) => (
            <div key={item.id} className="checkout-item">
              <img
                src={item.image}
                alt={item.name}
                className="checkout-item-image"
              />
              <div>
                <p>{item.name}</p>
                <p>
                  {formatPrice(item.price)} x {item.quantity}
                </p>
              </div>
            </div>
          ))}
          <h4 className="total">Total: {formatPrice(total)}</h4>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );

  return (
    <MDBContainer className="my-5">
      {!isModalOpen && (
        <div className="text-center">
          <h2>Checkout</h2>
          <p>Revisa tu pedido antes de confirmar</p>
          <MDBBtn color="primary" onClick={() => setIsModalOpen(true)}>
            Abrir checkout
          </MDBBtn>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content checkout-modal-content">
            <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
              Cerrar
            </button>
            {checkoutContent}
          </div>
        </div>
      )}
    </MDBContainer>
  );
}

export default CheckoutPage;
