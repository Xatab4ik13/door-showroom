import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail, orderStatusEmail } from '../services/email.js';

const router = Router();

const TBANK_TERMINAL_KEY = process.env.TBANK_TERMINAL_KEY || '';
const TBANK_PASSWORD = process.env.TBANK_PASSWORD || '';
const TBANK_API_URL = process.env.TBANK_API_URL || 'https://securepay.tinkoff.ru/v2';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://rusdoors.su';

/**
 * Generate T-Bank token: SHA-256 of concatenated sorted key=value pairs (including Password)
 */
function generateToken(data: Record<string, string | number>): string {
  const tokenData: Record<string, string | number> = { ...data, Password: TBANK_PASSWORD };
  // Remove Token field if present
  delete tokenData.Token;
  // Sort by key alphabetically and concatenate values
  const values = Object.keys(tokenData)
    .sort()
    .map(key => tokenData[key])
    .join('');
  return crypto.createHash('sha256').update(values).digest('hex');
}

/**
 * POST /api/payments/init — create payment session for a confirmed order
 * Body: { order_id: number }
 */
router.post('/init', async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id обязателен' });

    if (!TBANK_TERMINAL_KEY || !TBANK_PASSWORD) {
      console.error('[PAYMENTS] T-Bank credentials not configured');
      return res.status(500).json({ error: 'Платёжная система не настроена' });
    }

    // Get order
    const orderRes = await pool.query(
      'SELECT id, order_number, status, total, customer_email, customer_name, payment_status FROM orders WHERE id = $1',
      [order_id],
    );
    if (!orderRes.rows.length) return res.status(404).json({ error: 'Заказ не найден' });

    const order = orderRes.rows[0];

    // Only confirmed orders can be paid
    if (order.status !== 'confirmed') {
      return res.status(400).json({ error: 'Заказ должен быть подтверждён менеджером перед оплатой' });
    }
    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Заказ уже оплачен' });
    }

    // Amount in kopeks
    const amountKopeks = Math.round(Number(order.total) * 100);

    const initData: Record<string, string | number> = {
      TerminalKey: TBANK_TERMINAL_KEY,
      Amount: amountKopeks,
      OrderId: order.order_number,
      Description: `Оплата заказа ${order.order_number}`,
      SuccessURL: `${FRONTEND_URL}/account?payment=success&order=${order.order_number}`,
      FailURL: `${FRONTEND_URL}/account?payment=fail&order=${order.order_number}`,
    };

    const token = generateToken(initData);

    const tbankRes = await fetch(`${TBANK_API_URL}/Init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...initData, Token: token }),
    });

    const tbankData = await tbankRes.json();
    console.log('[PAYMENTS] T-Bank Init response:', JSON.stringify(tbankData));

    if (!tbankData.Success) {
      console.error('[PAYMENTS] T-Bank Init failed:', tbankData.Message, tbankData.Details);
      return res.status(502).json({ error: tbankData.Message || 'Ошибка платёжной системы' });
    }

    // Save payment ID to order
    await pool.query(
      "UPDATE orders SET payment_id = $1, payment_status = 'pending' WHERE id = $2",
      [tbankData.PaymentId, order.id],
    );

    res.json({
      paymentUrl: tbankData.PaymentURL,
      paymentId: tbankData.PaymentId,
    });
  } catch (err) {
    console.error('[PAYMENTS] Init error:', err);
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
});

/**
 * POST /api/payments/notification — T-Bank webhook callback
 * T-Bank sends POST with payment status updates
 */
router.post('/notification', async (req, res) => {
  try {
    const data = req.body;
    console.log('[PAYMENTS] Notification received:', JSON.stringify(data));

    // Verify token
    const receivedToken = data.Token;
    const checkData = { ...data };
    delete checkData.Token;
    const expectedToken = generateToken(checkData);

    if (receivedToken !== expectedToken) {
      console.error('[PAYMENTS] Invalid token in notification');
      return res.status(400).send('INVALID_TOKEN');
    }

    const { OrderId, Status, PaymentId } = data;

    // Find order by order_number
    const orderRes = await pool.query(
      'SELECT id, status, customer_email, customer_name, total FROM orders WHERE order_number = $1',
      [OrderId],
    );
    if (!orderRes.rows.length) {
      console.error('[PAYMENTS] Order not found for notification:', OrderId);
      return res.send('OK');
    }

    const order = orderRes.rows[0];

    if (Status === 'CONFIRMED' || Status === 'AUTHORIZED') {
      // Payment successful
      await pool.query(
        "UPDATE orders SET payment_status = 'paid', payment_id = $1, status = 'paid', updated_at = NOW() WHERE id = $2 AND status = 'confirmed'",
        [String(PaymentId), order.id],
      );
      console.log(`[PAYMENTS] Order ${OrderId} paid successfully`);

      // Send email notification
      setImmediate(async () => {
        try {
          const emailData = orderStatusEmail({
            order_number: OrderId,
            customer_name: order.customer_name,
            status: 'paid',
            total: Number(order.total),
          });
          if (emailData) {
            await sendEmail(order.customer_email, emailData.subject, emailData.html);
          }
        } catch (e) {
          console.error('[PAYMENTS] Email error:', e);
        }
      });
    } else if (Status === 'REJECTED' || Status === 'REVERSED' || Status === 'REFUNDED') {
      await pool.query(
        "UPDATE orders SET payment_status = $1, payment_id = $2, updated_at = NOW() WHERE id = $3",
        [Status.toLowerCase(), String(PaymentId), order.id],
      );
      console.log(`[PAYMENTS] Order ${OrderId} payment status: ${Status}`);
    }

    // T-Bank expects "OK" response
    res.send('OK');
  } catch (err) {
    console.error('[PAYMENTS] Notification error:', err);
    res.send('OK'); // Always respond OK to prevent retries
  }
});

/**
 * GET /api/payments/status/:order_id — check payment status
 */
router.get('/status/:order_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT payment_status, payment_id FROM orders WHERE id = $1',
      [req.params.order_id],
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PAYMENTS] Status check error:', err);
    res.status(500).json({ error: 'Ошибка проверки статуса' });
  }
});

export default router;
