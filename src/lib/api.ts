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
  pinned_order: number | null;
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

export interface PanelColor {
  id: number;
  name: string;
  image_url: string | null;
  price_modifier: number;
  sort_order: number;
}

export interface ProductService {
  id: number;
  name: string;
  description: string | null;
  price: number;
  price_type: 'fixed' | 'per_door';
  sort_order: number;
}

export interface RecommendedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

export interface ProductExtras {
  panel_colors: PanelColor[];
  services: ProductService[];
  recommendations: RecommendedProduct[];
}

export async function fetchProductExtras(productId: number): Promise<ProductExtras> {
  try {
    const res = await fetch(`${API_BASE}/api/product-extras/${productId}`);
    if (!res.ok) return { panel_colors: [], services: [], recommendations: [] };
    return res.json();
  } catch {
    return { panel_colors: [], services: [], recommendations: [] };
  }
}

// ==== Site content (CMS-lite) ====
export async function fetchContent<T = any>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/content/${key}`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function saveContent(key: string, value: any, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/content/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error('Save failed');
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/uploads/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  // Convert relative /uploads/... to absolute backend URL
  return data.url.startsWith('http') ? data.url : `${API_BASE}${data.url}`;
}

// ==== Categories admin ====
export interface AdminCategory {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  sort_order: number;
  product_count: number;
}

export async function fetchCategories(): Promise<AdminCategory[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) return [];
  return res.json();
}

export async function createCategory(data: { slug: string; name: string; parent_id?: number | null; sort_order?: number }, token: string): Promise<AdminCategory> {
  const res = await fetch(`${API_BASE}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Create failed');
  return res.json();
}

export async function updateCategory(id: number, data: Partial<AdminCategory>, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update failed');
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
}

// ==== Products admin ====
export async function createProduct(data: any, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Create failed');
  return res.json();
}

export async function updateProduct(id: number, data: any, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update failed');
}

// ==== Suppliers admin ====
export interface AdminSupplier {
  id: number;
  slug: string;
  name: string;
  format: string;
  sync_enabled: boolean;
  product_count: number;
}

export async function fetchSuppliers(token: string): Promise<AdminSupplier[]> {
  const res = await fetch(`${API_BASE}/api/suppliers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

// ==== Product extras admin (per-product overrides) ====
export interface AdminPanelColor {
  id: number;
  name: string;
  image_url: string | null;
  price_modifier: number;
  sort_order: number;
  category_slug: string | null;
  product_id: number | null;
}

export interface AdminService {
  id: number;
  name: string;
  description: string | null;
  price: number;
  price_type: 'fixed' | 'per_door';
  sort_order: number;
  category_slug: string | null;
  product_id: number | null;
}

export async function fetchAdminColors(params: { category_slug?: string; product_id?: number }, token: string): Promise<AdminPanelColor[]> {
  const sp = new URLSearchParams();
  if (params.category_slug) sp.set('category_slug', params.category_slug);
  if (params.product_id) sp.set('product_id', String(params.product_id));
  const res = await fetch(`${API_BASE}/api/product-extras/admin/colors?${sp}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAdminServices(params: { category_slug?: string; product_id?: number }, token: string): Promise<AdminService[]> {
  const sp = new URLSearchParams();
  if (params.category_slug) sp.set('category_slug', params.category_slug);
  if (params.product_id) sp.set('product_id', String(params.product_id));
  const res = await fetch(`${API_BASE}/api/product-extras/admin/services?${sp}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export interface ProductExcludes {
  services: number[];
  colors: number[];
}

export async function fetchProductExcludes(productId: number, token: string): Promise<ProductExcludes> {
  const res = await fetch(`${API_BASE}/api/product-extras/admin/excludes/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { services: [], colors: [] };
  return res.json();
}

export async function saveProductExcludes(productId: number, data: ProductExcludes, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/product-extras/admin/excludes/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Save failed');
}
