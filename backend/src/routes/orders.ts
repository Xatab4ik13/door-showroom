import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Allowed statuses and transitions
const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid: ['shipping'],
  shipping: ['completed'],
  completed: [],
  cancelled: [],
};

// POST /api/orders — create order (public, from checkout)
router.post('/', async (req, res) => {
  const { name, email, phone, address, comment, items, total, discount } = req.body;

  if (!name || !email || !items?.length) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find or create customer
    let customerResult = await client.query('SELECT id FROM customers WHERE email = $1', [email]);
    let customerId: number;

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;
      // Update name/phone if provided
      await client.query(
        'UPDATE customers SET name = COALESCE(NULLIF($1, \'\'), name), phone = COALESCE(NULLIF($2, \'\'), phone) WHERE id = $3',
        [name, phone, customerId],
      );
    } else {
      const insertRes = await client.query(
        'INSERT INTO customers (email, name, phone) VALUES ($1, $2, $3) RETURNING id',
        [email, name, phone || null],
      );
      customerId = insertRes.rows[0].id;
    }

    // Generate order number
    const orderNum = `RD-${Date.now().toString().slice(-6)}`;

    const orderRes = await client.query(
      `INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone, address, comment, items, total, discount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [orderNum, customerId, name, email, phone || null, address || null, comment || null, JSON.stringify(items), total || 0, discount || 0],
    );

    await client.query('COMMIT');
    res.status(201).json(orderRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ORDERS] Create error:', err);
    res.status(500).json({ error: 'Ошибка создания заказа' });
  } finally {
    client.release();
  }
});

// GET /api/orders — admin: list orders
router.get('/', requireAuth, async (req, res) => {
  const { status, search, page = '1', limit = '50' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const conditions: string[] = [];
  const params: any[] = [];

  if (status && status !== 'all') {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(o.order_number ILIKE $${params.length} OR o.customer_name ILIKE $${params.length} OR o.customer_email ILIKE $${params.length} OR o.customer_phone ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(Number(limit), offset);

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT o.*, a.name as manager_name
       FROM orders o
       LEFT JOIN admin_users a ON a.id = o.manager_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    ),
    pool.query(
      `SELECT COUNT(*) FROM orders o ${where}`,
      params.slice(0, -2),
    ),
  ]);

  res.json({
    orders: dataRes.rows,
    total: Number(countRes.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
});

// GET /api/orders/stats — admin: dashboard stats
router.get('/stats', requireAuth, async (_req, res) => {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int as total_orders,
      COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
      COUNT(*) FILTER (WHERE status = 'confirmed')::int as confirmed,
      COUNT(*) FILTER (WHERE status = 'paid')::int as paid,
      COUNT(*) FILTER (WHERE status = 'shipping')::int as shipping,
      COUNT(*) FILTER (WHERE status = 'completed')::int as completed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled,
      COALESCE(SUM(total) FILTER (WHERE status IN ('paid','shipping','completed')), 0)::numeric as revenue,
      COALESCE(SUM(total) FILTER (WHERE status = 'cancelled'), 0)::numeric as lost_revenue
    FROM orders
  `);
  res.json(result.rows[0]);
});

// GET /api/orders/monthly — admin: monthly breakdown
router.get('/monthly', requireAuth, async (req, res) => {
  const { months = '6' } = req.query;
  const result = await pool.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
      COUNT(*)::int as total_orders,
      COUNT(*) FILTER (WHERE status IN ('paid','shipping','completed'))::int as paid_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled_orders,
      COALESCE(SUM(total) FILTER (WHERE status IN ('paid','shipping','completed')), 0)::numeric as revenue,
      COALESCE(SUM(total) FILTER (WHERE status = 'cancelled'), 0)::numeric as lost_revenue
    FROM orders
    WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '${Number(months)} months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC
  `);
  res.json(result.rows);
});

// PATCH /api/orders/:id/status — admin: change status
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const orderRes = await pool.query('SELECT status FROM orders WHERE id = $1', [id]);
  if (!orderRes.rows.length) return res.status(404).json({ error: 'Заказ не найден' });

  const currentStatus = orderRes.rows[0].status;
  const allowed = STATUS_FLOW[currentStatus] || [];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Нельзя перевести из "${currentStatus}" в "${status}"` });
  }

  const updates: string[] = ['status = $1', 'updated_at = NOW()'];
  const params: any[] = [status];

  // If confirming, assign manager
  if (status === 'confirmed') {
    params.push(req.adminId);
    updates.push(`manager_id = $${params.length}`);
  }

  // If paid, update payment_status
  if (status === 'paid') {
    updates.push("payment_status = 'paid'");
  }

  params.push(id);
  await pool.query(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = $${params.length}`,
    params,
  );

  res.json({ ok: true });
});

// GET /api/orders/by-email/:email — customer: view own orders
router.get('/by-email/:email', async (req, res) => {
  const result = await pool.query(
    `SELECT id, order_number, status, items, total, discount, payment_status, created_at, updated_at
     FROM orders WHERE customer_email = $1 ORDER BY created_at DESC`,
    [req.params.email],
  );
  res.json(result.rows);
});

export default router;
