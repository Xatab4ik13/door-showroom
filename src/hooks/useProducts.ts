import { useState, useEffect } from 'react';
import { fetchProducts, type ApiProduct, type ProductsResponse } from '@/lib/api';

interface UseProductsParams {
  supplier?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useProducts(params?: UseProductsParams) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApi, setIsApi] = useState(false);

  const key = JSON.stringify(params || {});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProducts(params)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setTotal(data.total);
        setIsApi(true);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[useProducts] API unavailable, using mock data:', err.message);
        setError(err.message);
        setIsApi(false);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [key]);

  return { products, total, loading, error, isApi };
}
