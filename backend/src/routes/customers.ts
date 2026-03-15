import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/customers — admin: list customers with order stats
router.get('/', requireAuth, async (req, res) => {
  const { search, page = '1', limit = '50' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(Number(limit), offset);

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT c.*,
        COUNT(o.id)::int as order_count,
        COALESCE(SUM(o.total), 0)::numeric as total_spent,
        MAX(o.created_at) as last_order_at
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    ),
    pool.query(
      `SELECT COUNT(*) FROM customers c ${where}`,
      params.slice(0, -2),
    ),
  ]);

  res.json({
    customers: dataRes.rows,
    total: Number(countRes.rows[0].count),
  });
});

// GET /api/customers/:id — admin: customer detail with orders
router.get('/:id', requireAuth, async (req, res) => {
  const [custRes, ordersRes] = await Promise.all([
    pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]),
    pool.query(
      'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
      [req.params.id],
    ),
  ]);

  if (!custRes.rows.length) return res.status(404).json({ error: 'Клиент не найден' });

  res.json({
    customer: custRes.rows[0],
    orders: ordersRes.rows,
  });
});

export default router;
