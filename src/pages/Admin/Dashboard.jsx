import { useEffect, useState } from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBSpinner,
  MDBTable,
  MDBBadge,
} from 'mdb-react-ui-kit';
import {
  getDashboardStatsRequest,
  getDashboardOrdersByStatusRequest,
  getDashboardProductsSummaryRequest,
  getDashboardRecentOrdersRequest,
  getDashboardRecentUsersRequest,
  getDashboardTopProductsRequest,
  getDashboardSalesByCategoryRequest,
} from '../../services/adminDashboardService';
import AdminSalesChart from '../../components/AdminSalesChart/AdminSalesChart';
import './Admin.css';

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return '$0';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const ORDER_STATUS_LABELS = {
  pending: 'Pendiente',
  verified: 'Verificado',
  processing: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_COLORS = {
  pending: 'warning',
  verified: 'info',
  processing: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [ordersByStatus, setOrdersByStatus] = useState({
    pending: 0,
    verified: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [productsSummary, setProductsSummary] = useState({
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
  });
  const [averageTicket, setAverageTicket] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [
          statsRes,
          ordersByStatusRes,
          productsSummaryRes,
          recentOrdersRes,
          recentUsersRes,
          topProductsRes,
          salesByCategoryRes,
        ] = await Promise.all([
          getDashboardStatsRequest(),
          getDashboardOrdersByStatusRequest(),
          getDashboardProductsSummaryRequest(),
          getDashboardRecentOrdersRequest(5),
          getDashboardRecentUsersRequest(5),
          getDashboardTopProductsRequest(5),
          getDashboardSalesByCategoryRequest(),
        ]);

        setStats({
          totalSales: statsRes.totalSales ?? 0,
          totalOrders: statsRes.totalOrders ?? 0,
          totalCustomers: statsRes.totalCustomers ?? 0,
        });
        setOrdersByStatus(statsRes.ordersByStatus || ordersByStatusRes || {});
        setProductsSummary(statsRes.productsSummary || productsSummaryRes || {});
        setAverageTicket(statsRes.averageTicket ?? 0);
        setRecentOrders(recentOrdersRes || []);
        setRecentUsers(recentUsersRes || []);
        setTopProducts(topProductsRes || []);
        setSalesByCategory(salesByCategoryRes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No fue posible cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <MDBContainer className="my-5 text-center">
        <MDBSpinner role="status" />
      </MDBContainer>
    );
  }

  if (error) {
    return (
      <MDBContainer className="my-5">
        <div className="admin-feedback admin-feedback-error">{error}</div>
      </MDBContainer>
    );
  }

  const cards = [
    {
      title: 'Ventas totales',
      value: formatCurrency(stats.totalSales),
      description: 'Sumatoria de todas las órdenes registradas.',
    },
    {
      title: 'Total de pedidos',
      value: stats.totalOrders,
      description: 'Cantidad total de órdenes en el sistema.',
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers,
      description: 'Usuarios con rol de cliente.',
    },
    {
      title: 'Ticket promedio',
      value: formatCurrency(averageTicket),
      description: 'Valor promedio por orden.',
    },
    {
      title: 'Productos activos',
      value: productsSummary.activeProducts,
      description: 'Productos con stock mayor a 0.',
    },
    {
      title: 'Categorías',
      value: productsSummary.totalCategories,
      description: 'Categorías registradas en la tienda.',
    },
  ];

  const statusCards = [
    { title: 'Pendientes', value: ordersByStatus.pending, color: 'warning' },
    { title: 'Verificados', value: ordersByStatus.verified, color: 'info' },
    { title: 'En proceso', value: ordersByStatus.processing, color: 'primary' },
    { title: 'Completados', value: ordersByStatus.completed, color: 'success' },
    { title: 'Cancelados', value: ordersByStatus.cancelled, color: 'danger' },
  ];

  return (
    <MDBContainer className="my-4">
      <div className="admin-page-title">Dashboard</div>
      <div className="admin-page-subtitle">
        Resumen general de la tienda
      </div>

      <MDBRow className="mt-3 g-4">
        {cards.map((card) => (
          <MDBCol md="6" lg="4" key={card.title}>
            <div className="admin-panel h-100">
              <div className="text-uppercase text-muted mb-2">
                {card.title}
              </div>
              <div className="display-6 fw-bold mb-2">{card.value}</div>
              <div className="text-muted">{card.description}</div>
            </div>
          </MDBCol>
        ))}
      </MDBRow>

      <MDBRow className="mt-4 g-3">
        {statusCards.map((item) => (
          <MDBCol md="6" lg="4" xl key={item.title}>
            <div className="admin-panel h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="text-uppercase text-muted mb-2">{item.title}</div>
                <div className="display-6 fw-bold mb-2">{item.value}</div>
              </div>
              <MDBBadge color={item.color} pill className="mt-2">
                {item.title}
              </MDBBadge>
            </div>
          </MDBCol>
        ))}
      </MDBRow>

      {(productsSummary.lowStockProducts > 0 || productsSummary.outOfStockProducts > 0) && (
        <MDBRow className="mt-4">
          <MDBCol md="6">
            <div className="admin-panel border-warning">
              <div className="text-uppercase text-warning mb-2">Alertas de inventario</div>
              {productsSummary.lowStockProducts > 0 && (
                <div className="mb-2">
                  <strong>{productsSummary.lowStockProducts}</strong> producto(s) con stock bajo (≤ 5 unidades).
                </div>
              )}
              {productsSummary.outOfStockProducts > 0 && (
                <div>
                  <strong>{productsSummary.outOfStockProducts}</strong> producto(s) agotados.
                </div>
              )}
            </div>
          </MDBCol>
        </MDBRow>
      )}

      <MDBRow className="mt-4 g-4">
        <MDBCol lg="7">
          <div className="admin-panel h-100">
            <div className="text-uppercase text-muted mb-3">Pedidos recientes</div>
            {recentOrders.length === 0 ? (
              <div className="text-center text-muted my-4">No hay pedidos recientes.</div>
            ) : (
              <MDBTable responsive small className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <MDBBadge color={ORDER_STATUS_COLORS[order.status] || 'secondary'} pill>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </MDBBadge>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </MDBTable>
            )}
          </div>
        </MDBCol>

        <MDBCol lg="5">
          <div className="admin-panel h-100">
            <div className="text-uppercase text-muted mb-3">Productos más vendidos</div>
            {topProducts.length === 0 ? (
              <div className="text-center text-muted my-4">No hay ventas registradas.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topProducts.map((product) => (
                  <div key={product.id} className="d-flex align-items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-truncate">{product.name}</div>
                      <div className="text-muted small">{product.category}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold">{formatCurrency(product.totalSales)}</div>
                      <div className="text-muted small">{product.totalQuantity} uds.</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MDBCol>
      </MDBRow>

      <MDBRow className="mt-4 g-4">
        <MDBCol lg="7">
          <div className="admin-panel h-100">
            <div className="text-uppercase text-muted mb-3">Usuarios recientes</div>
            {recentUsers.length === 0 ? (
              <div className="text-center text-muted my-4">No hay usuarios recientes.</div>
            ) : (
              <MDBTable responsive small className="mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <MDBBadge color={user.role === 'admin' ? 'dark' : 'secondary'} pill>
                          {user.role === 'admin' ? 'Admin' : 'Cliente'}
                        </MDBBadge>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </MDBTable>
            )}
          </div>
        </MDBCol>

        <MDBCol lg="5">
          <div className="admin-panel h-100">
            <div className="text-uppercase text-muted mb-3">Ventas por categoría</div>
            {salesByCategory.length === 0 ? (
              <div className="text-center text-muted my-4">No hay ventas registradas.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {salesByCategory.map((category) => {
                  const maxSale = Math.max(...salesByCategory.map((c) => c.totalSales), 1);
                  const percentage = (category.totalSales / maxSale) * 100;
                  return (
                    <div key={category.id}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">{category.name}</span>
                        <span className="text-muted">{formatCurrency(category.totalSales)}</span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </MDBCol>
      </MDBRow>

      <div className="mt-4">
        <AdminSalesChart />
      </div>
    </MDBContainer>
  );
}

export default AdminDashboard;
