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
import './Admin.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const load = async (search = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setUsers(data.users || []);
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cargar los usuarios.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = () => {
    load(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    load('');
  };

  const handleRoleChange = async (userId, role) => {
    setError('');
    try {
      await apiClient(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      load(searchTerm.trim());
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible actualizar el rol.'
      );
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    setError('');
    try {
      await apiClient(`/admin/users/${userId}`, { method: 'DELETE' });
      load(searchTerm.trim());
    } catch (err) {
      const message =
        typeof err === 'string'
          ? err
          : err?.message || 'No fue posible eliminar el usuario.';
      setError(message);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <MDBContainer className="my-5">
      <div className="admin-page-title">Usuarios</div>
      <div className="admin-page-subtitle">Administra los usuarios registrados</div>
      {error && <div className="admin-feedback admin-feedback-error">{error}</div>}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">Filtros</div>
          <div className="admin-filters">
            <div className="field">
              <label htmlFor="user-search">Buscar por nombre</label>
              <MDBInput
                id="user-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej:Alejandro Trujillo"
                type="text"
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
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="form-select"
                  >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    className="admin-btn-sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      </div>
    </MDBContainer>
  );
}

export default AdminUsers;
