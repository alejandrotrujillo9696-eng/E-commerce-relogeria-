import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBInput,
} from 'mdb-react-ui-kit';
import { getOrderStatusLabel, orderStatusLabels } from '../../utils/orderStatusLabels';
import './Admin.css';

const ORDER_STATUS_OPTIONS = Object.entries(orderStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = async (search = '') => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiClient(
        `/admin/orders${search ? `?search=${encodeURIComponent(search)}` : ''}`
      );
      setOrders(data.orders || []);
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cargar las órdenes.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSearch = () => {
    const trimmed = searchId.trim();
    if (!trimmed) {
      loadOrders('');
      return;
    }

    const numericId = Number(trimmed);
    if (!Number.isInteger(numericId) || numericId < 1) {
      setError('Ingresa un ID de orden válido.');
      return;
    }

    loadOrders(String(numericId));
  };

  const handleClear = () => {
    setSearchId('');
    loadOrders('');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setError('');
    setSuccess('');
    try {
      const data = await apiClient(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccess(`El estado de la orden #${orderId} fue actualizado correctamente.`);
      await loadOrders(searchId);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: data.data.status }));
        setViewingOrder((prev) => ({ ...prev, status: data.data.status }));
      }
    } catch (err) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'No fue posible actualizar el estado de la orden.'
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleView = async (orderId) => {
    setError('');
    setSuccess('');

    if (selectedOrder && selectedOrder.id === orderId) {
      setViewingOrder(selectedOrder);
      return;
    }

    try {
      const data = await apiClient(`/admin/orders/${orderId}`);
      const order = data.order || null;
      setSelectedOrder(order);
      setViewingOrder(order);
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cargar la orden.'
      );
    }
  };

  const handleCloseDetail = () => {
    setViewingOrder(null);
  };

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    setError('');
    setSuccess('');
    try {
      await apiClient(`/admin/orders/${orderId}`, { method: 'DELETE' });
      setSuccess('La orden fue eliminada correctamente.');
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
        setViewingOrder(null);
      }
    } catch (err) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'No fue posible eliminar la orden.'
      );
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(Number(value || 0));

  const subtotal = viewingOrder
    ? viewingOrder.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      )
    : 0;
  const total = Number(viewingOrder?.total || 0);
  const shippingCost = total - subtotal;

  if (loading) return <p>Cargando...</p>;

  return (
    <MDBContainer className="my-5">
      <div className="admin-page-title">Órdenes</div>
      <div className="admin-page-subtitle">Consulta y gestiona las compras realizadas</div>
      {error && <div className="admin-feedback admin-feedback-error">{error}</div>}
      {success && <div className="admin-feedback admin-feedback-success">{success}</div>}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">Filtros</div>
          <div className="admin-filters">
            <div className="field">
              <label htmlFor="order-search">Buscar por ID de orden</label>
              <MDBInput
                id="order-search"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ej: 05"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div className="admin-actions">
              <MDBBtn size="sm" className="admin-btn-primary" onClick={handleSearch}>
                Buscar
              </MDBBtn>
              <MDBBtn size="sm" className="admin-btn-ghost" onClick={handleClear}>
                Limpiar
              </MDBBtn>
            </div>
          </div>
        </div>

        <MDBTable hover responsive className="admin-table">
          <MDBTableHead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user_id}</td>
                <td>${Number(order.total).toFixed(2)}</td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingOrderId === order.id}
                  >
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td className="actions">
                  <MDBBtn size="sm" className="admin-btn-primary admin-btn-sm" onClick={() => handleView(order.id)}>
                    Ver
                  </MDBBtn>
                  <MDBBtn size="sm" className="admin-btn-danger admin-btn-sm" onClick={() => handleDelete(order.id)}>
                    Eliminar
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      </div>

      {viewingOrder && (
        <div className="order-modal-overlay" onClick={handleCloseDetail}>
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="order-modal-header">
              <h3>ID: {String(viewingOrder.id).padStart(2, '0')}</h3>
              <MDBBtn
                size="sm"
                className="admin-btn-ghost"
                onClick={handleCloseDetail}
                aria-label="Cerrar detalle de orden"
              >
                Cerrar
              </MDBBtn>
            </div>

            <div className="order-modal-body">
              <div className="order-modal-section">
                <h4>Orden</h4>
                <p>
                  <strong>ID:</strong>{' '}
                  {String(viewingOrder.id).padStart(2, '0')}
                </p>
                <p>
                  <strong>Estado:</strong>{' '}
                   <span className="admin-badge">{getOrderStatusLabel(viewingOrder.status)}</span>
                </p>
                <p>
                  <strong>Fecha:</strong> {formatDate(viewingOrder.created_at)}
                </p>
              </div>

              <div className="order-modal-section">
                <h4>Cliente</h4>
                <p>
                  <strong>Nombre:</strong> {viewingOrder.first_name}{' '}
                  {viewingOrder.last_name}
                </p>
                <p>
                  <strong>Correo:</strong> {viewingOrder.email}
                </p>
                <p>
                  <strong>Teléfono:</strong> {viewingOrder.shipping_phone}
                </p>
              </div>

              <div className="order-modal-section">
                <h4>Envío</h4>
                <p>
                  {viewingOrder.shipping_name}, {viewingOrder.shipping_address},{' '}
                  {viewingOrder.shipping_city}, {viewingOrder.shipping_zip}
                </p>
              </div>

              <div className="order-modal-section">
                <h4>Productos</h4>
                <MDBTable bordered size="sm" className="admin-table">
                  <MDBTableHead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {viewingOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </MDBTableBody>
                </MDBTable>
              </div>

              <div className="order-modal-section">
                <h4>Resumen</h4>
                <p>
                  <strong>Subtotal:</strong> {formatCurrency(subtotal)}
                </p>
                <p>
                  <strong>Envío:</strong> {formatCurrency(shippingCost)}
                </p>
                <p>
                  <strong>Total:</strong> {formatCurrency(total)}
                </p>
              </div>
            </div>

            <div className="order-modal-footer">
              <MDBBtn size="sm" className="admin-btn-ghost" onClick={handleCloseDetail}>
                Volver
              </MDBBtn>
              <MDBBtn
                size="sm"
                className="admin-btn-danger"
                onClick={() => handleDelete(viewingOrder.id)}
              >
                Eliminar orden
              </MDBBtn>
            </div>
          </div>
        </div>
      )}
    </MDBContainer>
  );
}

export default AdminOrders;
