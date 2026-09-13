import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  MDBContainer,
  MDBBtn,
  MDBInput,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from 'mdb-react-ui-kit';
import './Admin.css';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient('/products/categories');
      setCategories(data.categories || []);
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cargar las categorías.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await apiClient(`/admin/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name }),
        });
      } else {
        await apiClient('/admin/categories', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });
      }
      setName('');
      setEditingId(null);
      load();
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible guardar la categoría.'
      );
    }
  };

  const handleEdit = (category) => {
    setName(category.name);
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar categoría?')) return;
    setError('');
    try {
      await apiClient(`/admin/categories/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible eliminar la categoría.'
      );
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <MDBContainer className="my-5">
      <h2>{editingId ? 'Editar categoría' : 'Crear categoría'}</h2>
      <form onSubmit={handleSubmit}>
        <MDBInput
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error && <p className="text-danger">{error}</p>}
        <MDBBtn type="submit" className="mt-2">
          {editingId ? 'Actualizar' : 'Crear'}
        </MDBBtn>
        {editingId && (
          <MDBBtn
            color="secondary"
            className="mt-2 ms-2"
            onClick={() => {
              setEditingId(null);
              setName('');
            }}
          >
            Cancelar
          </MDBBtn>
        )}
      </form>

      <h3 className="mt-5">Categorías</h3>
      <MDBTable bordered hover>
        <MDBTableHead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.name}</td>
              <td>
                <MDBBtn size="sm" onClick={() => handleEdit(category)}>
                  Editar
                </MDBBtn>
                <MDBBtn
                  size="sm"
                  color="danger"
                  onClick={() => handleDelete(category.id)}
                >
                  Eliminar
                </MDBBtn>
              </td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
    </MDBContainer>
  );
}

export default AdminCategories;
