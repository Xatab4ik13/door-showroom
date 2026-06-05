import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'rusdoors',
  user: process.env.DB_USER || 'rusdoors',
  password: process.env.DB_PASSWORD || 'changeme',
});

async function ensureDefaultAdminUsers(client: pg.PoolClient) {
  const adminHash = await bcrypt.hash('admin123', 12);
  const managerHash = await bcrypt.hash('manager123', 12);

  // Upsert: create or update password for default accounts
  await client.query(
    `INSERT INTO admin_users (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['admin', adminHash, 'Администратор'],
  );

  await client.query(
    `INSERT INTO admin_users (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['manager', managerHash, 'Менеджер'],
  );

  console.log('✅ Default admin users ensured (admin / manager)');
}

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      -- Suppliers table
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        format VARCHAR(50) NOT NULL DEFAULT 'manual',
        api_url TEXT,
        api_key TEXT,
        sync_enabled BOOLEAN DEFAULT false,
        last_sync_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Product categories
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES categories(id),
        sort_order INTEGER DEFAULT 0
      );

      -- Main products table
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        source_sku VARCHAR(255),
        name VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        description TEXT,
        price NUMERIC(10,2),
        old_price NUMERIC(10,2),
        manufacturer VARCHAR(255),
        material VARCHAR(255),
        color VARCHAR(255),
        width INTEGER,
        height INTEGER,
        thickness INTEGER,
        weight NUMERIC(8,2),
        in_stock BOOLEAN DEFAULT true,
        images JSONB DEFAULT '[]',
        specs JSONB DEFAULT '{}',
        sync_status VARCHAR(20) DEFAULT 'active',
        pinned_order INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(supplier_id, source_sku)
      );
      ALTER TABLE products ADD COLUMN IF NOT EXISTS pinned_order INTEGER;
      CREATE INDEX IF NOT EXISTS idx_products_pinned ON products(pinned_order) WHERE pinned_order IS NOT NULL;

      -- Sync log
      CREATE TABLE IF NOT EXISTS sync_log (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        started_at TIMESTAMPTZ DEFAULT NOW(),
        finished_at TIMESTAMPTZ,
        status VARCHAR(20) DEFAULT 'running',
        products_added INTEGER DEFAULT 0,
        products_updated INTEGER DEFAULT 0,
        products_removed INTEGER DEFAULT 0,
        error TEXT
      );

      -- Admin users
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Customers table
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL DEFAULT '',
        phone VARCHAR(50),
        password_hash VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        address TEXT,
        comment TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        items JSONB NOT NULL DEFAULT '[]',
        total NUMERIC(10,2) NOT NULL DEFAULT 0,
        discount NUMERIC(10,2) DEFAULT 0,
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        payment_id VARCHAR(100),
        manager_id INTEGER REFERENCES admin_users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Add payment_id column if missing (migration for existing DBs)
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);

      -- Insert default suppliers
      INSERT INTO suppliers (slug, name, format, sync_enabled)
      VALUES 
        ('dvercom', 'Скамбио Порте (dver.com)', 'csv_xml', true),
        ('supplier2', 'Поставщик 2', 'manual', false),
        ('supplier3', 'Поставщик 3', 'manual', false)
      ON CONFLICT (slug) DO NOTHING;

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_source_sku ON products(source_sku);
      CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

      -- Internal panel colors (per category and/or per product)
      CREATE TABLE IF NOT EXISTS panel_colors (
        id SERIAL PRIMARY KEY,
        category_slug VARCHAR(100),
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        image_url TEXT,
        price_modifier NUMERIC(10,2) DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_panel_colors_cat ON panel_colors(category_slug);
      CREATE INDEX IF NOT EXISTS idx_panel_colors_prod ON panel_colors(product_id);

      -- Additional services (per category and/or per product)
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        category_slug VARCHAR(100),
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        price_type VARCHAR(20) NOT NULL DEFAULT 'fixed', -- 'fixed' | 'per_door'
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_services_cat ON services(category_slug);
      CREATE INDEX IF NOT EXISTS idx_services_prod ON services(product_id);

      -- Per-product service excludes (hide a category-level service on a specific product)
      CREATE TABLE IF NOT EXISTS product_service_excludes (
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, service_id)
      );

      -- Per-product panel-color excludes (hide a category-level color on a specific product)
      CREATE TABLE IF NOT EXISTS product_color_excludes (
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        color_id INTEGER NOT NULL REFERENCES panel_colors(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, color_id)
      );

      -- Recommended products (per product and/or per category)
      CREATE TABLE IF NOT EXISTS product_recommendations (
        id SERIAL PRIMARY KEY,
        source_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        source_category_slug VARCHAR(100),
        recommended_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_reco_prod ON product_recommendations(source_product_id);
      CREATE INDEX IF NOT EXISTS idx_reco_cat ON product_recommendations(source_category_slug);
    `);

    await ensureDefaultAdminUsers(client);
    console.log('✅ Database initialized');
  } finally {
    client.release();
  }
}
