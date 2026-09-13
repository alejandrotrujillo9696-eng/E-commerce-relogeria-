import { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductList.css';
import { MDBSpinner } from 'mdb-react-ui-kit';
import { useProductCatalog } from '../../hooks/useProductFilters';
import { getHomeSectionRequest } from '../../services/homeSectionPublicService';

function HomeProductList() {
  const { products: catalogProducts, loading: catalogLoading, error: catalogError } = useProductCatalog({ limit: 32 });
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getHomeSectionRequest();
        if (!active) return;
        setSection(data);
      } catch {
        if (!active) return;
        setSection(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const products = section ? section.items : catalogProducts;
  const hasError = !section && catalogError;

  if (loading) {
    return (
      <div className="text-center my-5">
        <MDBSpinner role="status" />
      </div>
    );
  }

  if (hasError) {
    return <p className="text-center text-danger">{catalogError}</p>;
  }

  if (!section && !catalogLoading && products.length === 0) {
    return <p className="text-center">No se encontraron productos.</p>;
  }

  return (
    <div className="product-list-container">
      {products.length > 0 && (
        <div className="product-list">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomeProductList;
