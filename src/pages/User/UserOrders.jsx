import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
} from 'mdb-react-ui-kit';
import { getOrderStatusLabel } from '../../utils/orderStatusLabels';
import formatPrice from '../../utils/formatPrice';

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiClient('/orders');
      setOrders(data.orders || []);
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cargar tus pedidos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleView = async (orderId) => {
    setError('');
    setSuccess('');
    try {
      const data = await apiClient(`/orders/${orderId}`);
      setSelectedOrder(data.order || null);
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cargar el pedido.'
      );
    }
  };

  const handleCancel = async (orderId) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas cancelar esta compra?'
    );
    if (!confirmed) return;

    setCancellingId(orderId);
    setError('');
    setSuccess('');
    try {
      await apiClient(`/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });
      setSuccess('La compra fue cancelada correctamente.');
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: 'cancelled' }));
      }
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cancelar la compra.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    setError('');
    setSuccess('');
    try {
      await apiClient(`/orders/${orderId}`, {
        method: 'DELETE',
      });
      setSuccess('El pedido fue eliminado correctamente.');
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible eliminar el pedido.'
      );
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <MDBContainer className="my-5">
      <h2>Mis pedidos</h2>
      {error && <p className="text-danger">{error}</p>}
      {success && <p className="text-success">{success}</p>}
      {orders.length === 0 ? (
        <p>No tienes pedidos realizados.</p>
      ) : (
        <MDBTable bordered hover>
          <MDBTableHead>
            <tr>
              <th>ID</th>
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
                <td>{formatPrice(order.total)}</td>
                <td>{getOrderStatusLabel(order.status)}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <MDBBtn size="sm" onClick={() => handleView(order.id)}>
                    Ver
                  </MDBBtn>
                  {order.status === 'pending' && (
                    <MDBBtn
                      size="sm"
                      color="danger"
                      className="ms-2"
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                    >
                      {cancellingId === order.id
                        ? 'Cancelando...'
                        : 'Cancelar compra'}
                    </MDBBtn>
                  )}
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      )}

      {selectedOrder && (
        <div className="mt-4">
          <h3>Pedido #{selectedOrder.id}</h3>
          <p>
            <strong>Total:</strong> {formatPrice(selectedOrder.total)}
          </p>
          <p>
            <strong>Estado:</strong> {getOrderStatusLabel(selectedOrder.status)}
          </p>
          <p>
            <strong>Envío:</strong> {selectedOrder.shipping_name},{' '}
            {selectedOrder.shipping_address}, {selectedOrder.shipping_city},{' '}
            {selectedOrder.shipping_zip}, {selectedOrder.shipping_phone}
          </p>
          {selectedOrder.items && selectedOrder.items.length > 0 && (
            <>
              <h4>Items</h4>
              <MDBTable bordered>
                <MDBTableHead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.price)}</td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </>
          )}
          <div className="d-flex gap-2 mt-3">
            <MDBBtn onClick={() => setSelectedOrder(null)}>Cerrar</MDBBtn>
            {selectedOrder.status === 'pending' && (
              <MDBBtn
                color="danger"
                onClick={() => handleDelete(selectedOrder.id)}
              >
                Eliminar pedido
              </MDBBtn>
            )}
          </div>
        </div>
      )}
    </MDBContainer>
  );
}

export default UserOrders;
