const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

export interface ApiProduct {
  id: number;
  supplier_id: number;
  source_sku: string;
  name: string;
  slug: string;
  category_id: number | null;
  description: string | null;
  price: number;
  old_price: number | null;
  manufacturer: string | null;
  material: string | null;
  color: string | null;
  width: number | null;
  height: number | null;
  images: string[];
  in_stock: boolean;
  specs: Record<string, string | null>;
  supplier_name: string;
  supplier_slug: string;
  category_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchProducts(params?: {
  supplier?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.supplier) searchParams.set('supplier', params.supplier);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/api/products?${searchParams}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchProduct(slug: string): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/api/products/${slug}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
