import { useEffect } from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import './ProductList.css';
import {
  MDBPagination,
  MDBPaginationItem,
  MDBPaginationLink,
  MDBSpinner,
} from 'mdb-react-ui-kit';
import { useProductCatalog } from '../../hooks/useProductFilters';

function ProductList() {
  const {
    products,
    categories,
    searchTerm,
    setSearchTerm,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedCategory,
    setSelectedCategory,
    currentPage,
    totalPages,
    loading,
    error,
    handlePageChange,
  } = useProductCatalog({ limit: 32 });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  return (
    <>
      <div className="product-list-container">
        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Categorías</option>

            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center my-5">
            <MDBSpinner role="status" />
            <p className="mt-2">Cargando productos…</p>
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-danger">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center">No se encontraron productos.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-list">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <nav aria-label="Page navigation">
            <MDBPagination className="mb-0 justify-content-center">
              <MDBPaginationItem disabled={currentPage === 1}>
                <MDBPaginationLink
                  tag="button"
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </MDBPaginationLink>
              </MDBPaginationItem>

              {Array.from({ length: totalPages }, (_, index) => (
                <MDBPaginationItem
                  key={index + 1}
                  active={currentPage === index + 1}
                >
                  <MDBPaginationLink
                    tag="button"
                    type="button"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </MDBPaginationLink>
                </MDBPaginationItem>
              ))}

              <MDBPaginationItem disabled={currentPage === totalPages}>
                <MDBPaginationLink
                  tag="button"
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </MDBPaginationLink>
              </MDBPaginationItem>
            </MDBPagination>
          </nav>
        )}
      </div>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <WhatsAppButton />
    </>
  );
}

export default ProductList;