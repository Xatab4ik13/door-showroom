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

export interface ProductFilters {
  supplier?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  price_min?: number;
  price_max?: number;
  manufacturer?: string;
  material?: string;
  color?: string;
  sort?: 'price' | 'name' | 'updated_at';
  order?: 'asc' | 'desc';
}

export async function fetchProducts(params?: ProductFilters): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.supplier) searchParams.set('supplier', params.supplier);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.price_min) searchParams.set('price_min', String(params.price_min));
  if (params?.price_max) searchParams.set('price_max', String(params.price_max));
  if (params?.manufacturer) searchParams.set('manufacturer', params.manufacturer);
  if (params?.material) searchParams.set('material', params.material);
  if (params?.color) searchParams.set('color', params.color);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.order) searchParams.set('order', params.order);

  const res = await fetch(`${API_BASE}/api/products?${searchParams}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Facets {
  manufacturers: string[];
  materials: string[];
  colors: string[];
  categories: { slug: string; name: string; count: number }[];
}

export async function fetchFacets(): Promise<Facets> {
  const res = await fetch(`${API_BASE}/api/products/facets`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchProduct(slug: string): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/api/products/${slug}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
