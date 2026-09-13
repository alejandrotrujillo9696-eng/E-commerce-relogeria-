import { useState, useEffect, useRef } from 'react';
import apiClient from '../../services/apiClient';
import {
  MDBContainer,
  MDBBtn,
  MDBInput,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from 'mdb-react-ui-kit';
import formatPrice from '../../utils/formatPrice';
import './Admin.css';

const getStockStatus = (stock) => {
  const value = Number(stock ?? 0);
  if (value <= 0) {
    return { label: 'Agotado', className: 'badge-agotado' };
  }
  if (value <= 5) {
    return { label: 'Stock bajo', className: 'badge-stock-bajo' };
  }
  return { label: 'Disponible', className: 'badge-disponible' };
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    stock: '0',
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    stock: '0',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const savedScrollRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient('/products?limit=100&includeStock=true'),
        apiClient('/products/categories'),
      ]);
      setProducts(productsRes.products || []);
      setCategories(categoriesRes.categories || []);
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible cargar los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateChange = (field) => (e) => {
    setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...createForm,
        price: Number(createForm.price),
        stock: Number(createForm.stock),
        categoryId: Number(createForm.categoryId),
      };
      await apiClient('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCreateForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        categoryId: '',
        stock: '0',
      });
      setSuccess('Producto creado correctamente.');
      load();
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible guardar el producto.'
      );
    }
  };

  const handleEdit = (product) => {
    savedScrollRef.current = window.scrollY;
    setEditForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.image,
      categoryId: String(product.category_id || ''),
      stock: String(product.stock ?? 0),
    });
    setEditingProduct(product);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: '',
      stock: '0',
    });
  };

  const handleEditChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...editForm,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        categoryId: Number(editForm.categoryId),
      };
      await apiClient(`/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setSuccess('Producto actualizado correctamente.');
      handleCloseEdit();
      load();
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible actualizar el producto.'
      );
    }
  };

  useEffect(() => {
    if (!editingProduct && savedScrollRef.current !== null && products.length > 0) {
      window.scrollTo(0, savedScrollRef.current);
      savedScrollRef.current = null;
    }
  }, [editingProduct, products]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    setError('');
    setSuccess('');
    try {
      await apiClient(`/admin/products/${id}`, { method: 'DELETE' });
      setSuccess('Producto eliminado correctamente.');
      load();
      if (editingProduct && editingProduct.id === id) {
        handleCloseEdit();
      }
    } catch (err) {
      setError(
        typeof err === 'string' ? err : 'No fue posible eliminar el producto.'
      );
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <MDBContainer className="my-5">
      <div className="admin-page-title">Productos</div>
      <div className="admin-page-subtitle">Crea y gestiona los productos de la tienda</div>
      {error && <div className="admin-feedback admin-feedback-error">{error}</div>}
      {success && <div className="admin-feedback admin-feedback-success">{success}</div>}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">Crear producto</div>
        </div>
        <form onSubmit={handleCreateSubmit}>
          <MDBInput
            label="Nombre"
            value={createForm.name}
            onChange={handleCreateChange('name')}
            required
          />
          <MDBInput
            label="Descripción"
            value={createForm.description}
            onChange={handleCreateChange('description')}
            required
          />
          <MDBInput
            label="Precio"
            type="number"
            value={createForm.price}
            onChange={handleCreateChange('price')}
            required
          />
          <MDBInput
            label="URL imagen"
            value={createForm.imageUrl}
            onChange={handleCreateChange('imageUrl')}
            required
          />
          <select
            className="form-select mt-2"
            value={createForm.categoryId}
            onChange={handleCreateChange('categoryId')}
            required
          >
            <option value="">Selecciona categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <MDBInput
            label="Stock"
            type="number"
            min="0"
            value={createForm.stock}
            onChange={handleCreateChange('stock')}
            required
          />
          <MDBBtn type="submit" className="mt-2">
            Crear
          </MDBBtn>
        </form>
      </div>

      <h3 className="mt-5">Productos</h3>
      <MDBTable bordered hover>
        <MDBTableHead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {products.map((product) => {
            const status = getStockStatus(product.stock);
            return (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{formatPrice(product.price)}</td>
                <td>{product.category?.name || product.category}</td>
                <td>
                  <div className="d-flex flex-column align-items-start gap-1">
                    <span>{product.stock ?? 0} unidades</span>
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </div>
                </td>
                <td>
                  <MDBBtn size="sm" onClick={() => handleEdit(product)}>
                    Editar
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Eliminar
                  </MDBBtn>
                </td>
              </tr>
            );
          })}
        </MDBTableBody>
      </MDBTable>

      {editingProduct && (
        <div className="order-modal-overlay" onClick={handleCloseEdit}>
          <div
            className="order-modal product-edit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <form className="product-edit-form" onSubmit={handleEditSubmit}>
              <div className="order-modal-header">
                <h3>Editar producto</h3>
                <MDBBtn
                  size="sm"
                  className="admin-btn-ghost"
                  onClick={handleCloseEdit}
                  aria-label="Cerrar edición de producto"
                >
                  Cerrar
                </MDBBtn>
              </div>

              <div className="order-modal-body">
                <MDBInput
                  label="Nombre"
                  value={editForm.name}
                  onChange={handleEditChange('name')}
                  required
                />
                <MDBInput
                  label="Descripción"
                  value={editForm.description}
                  onChange={handleEditChange('description')}
                  required
                />
                <MDBInput
                  label="Precio"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditChange('price')}
                  required
                />
                <MDBInput
                  label="URL imagen"
                  value={editForm.imageUrl}
                  onChange={handleEditChange('imageUrl')}
                  required
                />
                <select
                  className="form-select"
                  value={editForm.categoryId}
                  onChange={handleEditChange('categoryId')}
                  required
                >
                  <option value="">Selecciona categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <MDBInput
                  label="Stock"
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={handleEditChange('stock')}
                  required
                />
                {error && editingProduct && (
                  <p className="text-danger">{error}</p>
                )}
              </div>

              <div className="order-modal-footer">
                <MDBBtn size="sm" className="admin-btn-ghost" onClick={handleCloseEdit} type="button">
                  Cancelar
                </MDBBtn>
                <MDBBtn size="sm" className="admin-btn-primary" type="submit">
                  Guardar
                </MDBBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </MDBContainer>
  );
}

export default AdminProducts;
