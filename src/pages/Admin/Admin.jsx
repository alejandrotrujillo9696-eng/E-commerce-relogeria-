import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const user = useSelector((state) => state.auth.user);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-container">
      <h1>Panel Administrativo</h1>
      <div className="admin-links">
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/products">Productos</Link>
        <Link to="/admin/categories">Categorías</Link>
        <Link to="/admin/orders">Órdenes</Link>
        <Link to="/admin/users">Usuarios</Link>
      </div>
    </div>
  );
}

export default Admin;
