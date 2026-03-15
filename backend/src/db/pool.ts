import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'rusdoors',
  user: process.env.DB_USER || 'rusdoors',
  password: process.env.DB_PASSWORD || 'changeme',
});

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
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(supplier_id, source_sku)
      );

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
        manager_id INTEGER REFERENCES admin_users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

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
    `);
    console.log('✅ Database initialized');
  } finally {
    client.release();
  }
}
