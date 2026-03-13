import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { pool, initDatabase } from './db/pool.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import suppliersRouter from './routes/suppliers.js';
import importRouter from './routes/import.js';
import { syncDverCom } from './services/dvercom-sync.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://rusdoors.su',
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
