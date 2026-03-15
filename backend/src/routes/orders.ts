import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { sendEmail, orderCreatedEmail, orderStatusEmail, accountCreatedEmail } from '../services/email.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
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

// Generate unique order number using DB sequence
async function generateOrderNumber(client: any): Promise<string> {
  await client.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001`);
  const res = await client.query(`SELECT nextval('order_number_seq') as num`);
  const num = String(res.rows[0].num).padStart(4, '0');
  return `RD-${num}`;
}

// Generate random password
function generatePassword(): string {
  return crypto.randomBytes(4).toString('hex'); // 8 chars
}

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
    let customerResult = await client.query('SELECT id, password_hash FROM customers WHERE email = $1', [email]);
    let customerId: number;
    let generatedPassword: string | null = null;

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;
      await client.query(
        'UPDATE customers SET name = COALESCE(NULLIF($1, \'\'), name), phone = COALESCE(NULLIF($2, \'\'), phone) WHERE id = $3',
        [name, phone, customerId],
      );

      // If customer has no password, generate one (auto-create account)
      if (!customerResult.rows[0].password_hash) {
        generatedPassword = generatePassword();
        const hash = await bcrypt.hash(generatedPassword, 12);
        await client.query('UPDATE customers SET password_hash = $1 WHERE id = $2', [hash, customerId]);
      }
    } else {
      // New customer — auto-create account with generated password
      generatedPassword = generatePassword();
      const hash = await bcrypt.hash(generatedPassword, 12);
      const insertRes = await client.query(
        'INSERT INTO customers (email, name, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
        [email, name, phone || null, hash],
      );
      customerId = insertRes.rows[0].id;
    }

    const orderNum = await generateOrderNumber(client);

    const orderRes = await client.query(
      `INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone, address, comment, items, total, discount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [orderNum, customerId, name, email, phone || null, address || null, comment || null, JSON.stringify(items), total || 0, discount || 0],
    );

    await client.query('COMMIT');

    const order = orderRes.rows[0];

    // Send emails asynchronously (don't block response)
    setImmediate(async () => {
      // 1. Order confirmation email
      const orderEmail = orderCreatedEmail({
        order_number: order.order_number,
        customer_name: name,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        total: Number(order.total),
      });
      await sendEmail(email, orderEmail.subject, orderEmail.html);

      // 2. Account created email (if new account)
      if (generatedPassword) {
        const accEmail = accountCreatedEmail({
          name,
          email,
          password: generatedPassword,
        });
        await sendEmail(email, accEmail.subject, accEmail.html);
      }
    });

    res.status(201).json(order);
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
  try {
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
  } catch (err) {
    console.error('[ORDERS] List error:', err);
    res.status(500).json({ error: 'Ошибка загрузки заказов' });
  }
});

// GET /api/orders/stats — admin: dashboard stats
router.get('/stats', requireAuth, async (_req, res) => {
  try {
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
  } catch (err) {
    console.error('[ORDERS] Stats error:', err);
    res.status(500).json({ error: 'Ошибка загрузки статистики' });
  }
});

// GET /api/orders/monthly — admin: monthly breakdown
router.get('/monthly', requireAuth, async (req, res) => {
  try {
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        COUNT(*)::int as total_orders,
        COUNT(*) FILTER (WHERE status IN ('paid','shipping','completed'))::int as paid_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled_orders,
        COALESCE(SUM(total) FILTER (WHERE status IN ('paid','shipping','completed')), 0)::numeric as revenue,
        COALESCE(SUM(total) FILTER (WHERE status = 'cancelled'), 0)::numeric as lost_revenue
      FROM orders
      WHERE created_at >= DATE_TRUNC('month', NOW()) - ($1 || ' months')::interval
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `, [String(months)]);
    res.json(result.rows);
  } catch (err) {
    console.error('[ORDERS] Monthly error:', err);
    res.status(500).json({ error: 'Ошибка загрузки статистики' });
  }
});

// GET /api/orders/my/list — customer: view own orders (JWT-protected)
router.get('/my/list', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; email: string; type: string };
    if (decoded.type !== 'customer') {
      return res.status(401).json({ error: 'Невалидный токен' });
    }

    const result = await pool.query(
      `SELECT id, order_number, status, items, total, discount, payment_status, created_at, updated_at
       FROM orders WHERE customer_email = $1 ORDER BY created_at DESC`,
      [decoded.email],
    );
    res.json(result.rows);
  } catch {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
});

// GET /api/orders/:id — get single order (for status polling)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);
    const result = await pool.query(
      `SELECT id, order_number, status, items, total, discount, payment_status, created_at, updated_at
       FROM orders WHERE ${isNumeric ? 'id = $1::int' : 'order_number = $1'}`,
      [id],
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[ORDERS] Get error:', err);
    res.status(500).json({ error: 'Ошибка загрузки заказа' });
  }
});

// PATCH /api/orders/:id/status — admin: change status
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const orderRes = await pool.query(
      'SELECT id, order_number, status, customer_name, customer_email, total FROM orders WHERE id = $1',
      [id],
    );
    if (!orderRes.rows.length) return res.status(404).json({ error: 'Заказ не найден' });

    const order = orderRes.rows[0];
    const currentStatus = order.status;
    const allowed = STATUS_FLOW[currentStatus] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Нельзя перевести из "${currentStatus}" в "${status}"` });
    }

    const updates: string[] = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status];

    if (status === 'confirmed') {
      params.push(req.adminId);
      updates.push(`manager_id = $${params.length}`);
    }

    if (status === 'paid') {
      updates.push("payment_status = 'paid'");
    }

    params.push(id);
    await pool.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${params.length}`,
      params,
    );

    // Send status notification email asynchronously
    setImmediate(async () => {
      const emailData = orderStatusEmail({
        order_number: order.order_number,
        customer_name: order.customer_name,
        status,
        total: Number(order.total),
      });
      if (emailData) {
        await sendEmail(order.customer_email, emailData.subject, emailData.html);
      }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[ORDERS] Status change error:', err);
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
});

export default router;