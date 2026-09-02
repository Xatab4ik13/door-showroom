import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { pool, initDatabase } from './db/pool.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import suppliersRouter from './routes/suppliers.js';
import importRouter from './routes/import.js';
import ordersRouter from './routes/orders.js';
import customersRouter from './routes/customers.js';
import customerAuthRouter from './routes/customer-auth.js';
import paymentsRouter from './routes/payments.js';
import productExtrasRouter from './routes/product-extras.js';
import uploadsRouter from './routes/uploads.js';
import contentRouter from './routes/content.js';
import categoriesRouter from './routes/categories.js';
import leadsRouter from './routes/leads.js';
import path from 'path';
import express2 from 'express';
import { syncDverCom } from './services/dvercom-sync.js';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'https://rusdoors.su',
  'https://www.rusdoors.su',
  'https://id-preview--84d6a2c8-b4c0-4fe5-bd18-0ac658dfad9f.lovable.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin(origin, cb) {
    // allow server-to-server (no origin) and allowed list
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/import', importRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/customer-auth', customerAuthRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/product-extras', productExtrasRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/content', contentRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/leads', leadsRouter);

// Static serve uploads (in case nginx doesn't handle it)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express2.static(UPLOAD_DIR, { maxAge: '7d' }));

// CRON: sync dver.com every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('[CRON] Starting dver.com sync...');
  try {
    await syncDverCom();
    console.log('[CRON] dver.com sync completed');
  } catch (err) {
    console.error('[CRON] dver.com sync failed:', err);
  }
});

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
}

start().catch(console.error);
