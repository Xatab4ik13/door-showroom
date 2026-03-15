import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.timeweb.ru',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM_NAME = process.env.SMTP_FROM_NAME || 'RUSDOORS';
const FROM_EMAIL = process.env.SMTP_USER || 'noreply@rusdoors.su';
const SITE_URL = process.env.FRONTEND_URL || 'https://rusdoors.su';

function baseTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <!-- Header -->
      <tr>
        <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:3px;">
            RUS<span style="color:#2d8bc9;">D</span>OORS
          </span>
        </td>
      </tr>
      <!-- Title -->
      <tr>
        <td style="padding:32px 32px 8px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:1px;text-transform:uppercase;">
            ${title}
          </h1>
        </td>
      </tr>
      <!-- Content -->
      <tr>
        <td style="padding:16px 32px 32px;">
          ${content}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f9f8f6;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">
            <a href="${SITE_URL}" style="color:#2d8bc9;text-decoration:none;">${SITE_URL.replace('https://', '')}</a>
          </p>
          <p style="margin:4px 0 0;font-size:11px;color:#bbb;">
            Вы получили это письмо, т.к. оформили заказ на сайте RUSDOORS
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function orderItemsTable(items: { name: string; quantity: number; price: number }[], total: number): string {
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#666;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:right;font-weight:600;">
        ${new Intl.NumberFormat('ru-RU').format(i.price * i.quantity)} ₽
      </td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr style="border-bottom:2px solid #eee;">
        <th style="padding:8px 0;text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Товар</th>
        <th style="padding:8px 0;text-align:center;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Кол-во</th>
        <th style="padding:8px 0;text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Сумма</th>
      </tr>
      ${rows}
      <tr>
        <td colspan="2" style="padding:12px 0;font-size:16px;font-weight:700;color:#1a1a1a;">Итого</td>
        <td style="padding:12px 0;font-size:18px;font-weight:700;color:#2d8bc9;text-align:right;">
          ${new Intl.NumberFormat('ru-RU').format(total)} ₽
        </td>
      </tr>
    </table>
  `;
}

function buttonHtml(text: string, url: string): string {
  return `
    <div style="text-align:center;margin:24px 0;">
      <a href="${url}" style="display:inline-block;padding:14px 32px;background:#2d8bc9;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
        ${text}
      </a>
    </div>
  `;
}

// ==================== EMAIL TEMPLATES ====================

export function orderCreatedEmail(order: {
  order_number: string;
  customer_name: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}): { subject: string; html: string } {
  return {
    subject: `Заказ ${order.order_number} принят — RUSDOORS`,
    html: baseTemplate('Заказ принят', `
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
        ${order.customer_name}, спасибо за заказ! Ваша заявка <strong>${order.order_number}</strong> принята в обработку.
      </p>
      <p style="font-size:14px;color:#666;margin:0 0 16px;">
        Менеджер свяжется с вами для подтверждения деталей и стоимости доставки.
      </p>
      ${orderItemsTable(order.items, order.total)}
      ${buttonHtml('Отследить заказ', `${SITE_URL}/account`)}
    `),
  };
}

export function accountCreatedEmail(data: {
  name: string;
  email: string;
  password: string;
}): { subject: string; html: string } {
  return {
    subject: 'Ваш личный кабинет — RUSDOORS',
    html: baseTemplate('Личный кабинет создан', `
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
        ${data.name}, для вас создан личный кабинет. Здесь вы можете отслеживать статус заказов.
      </p>
      <div style="background:#f5f3ef;border-radius:12px;padding:20px 24px;margin:16px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">Данные для входа</p>
        <p style="margin:0 0 4px;font-size:15px;color:#333;"><strong>Email:</strong> ${data.email}</p>
        <p style="margin:0;font-size:15px;color:#333;"><strong>Пароль:</strong> ${data.password}</p>
      </div>
      <p style="font-size:13px;color:#999;margin:16px 0 0;">
        Рекомендуем сменить пароль после первого входа в разделе «Профиль».
      </p>
      ${buttonHtml('Войти в кабинет', `${SITE_URL}/login`)}
    `),
  };
}

export function passwordResetEmail(data: {
  name: string;
  resetCode: string;
}): { subject: string; html: string } {
  return {
    subject: 'Восстановление пароля — RUSDOORS',
    html: baseTemplate('Восстановление пароля', `
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
        ${data.name}, вы запросили восстановление пароля.
      </p>
      <div style="background:#f5f3ef;border-radius:12px;padding:20px 24px;margin:16px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">Код восстановления</p>
        <p style="margin:0;font-size:32px;font-weight:700;color:#1a1a1a;letter-spacing:6px;">${data.resetCode}</p>
      </div>
      <p style="font-size:13px;color:#999;margin:16px 0 0;">
        Код действителен 15 минут. Если вы не запрашивали восстановление, проигнорируйте это письмо.
      </p>
      ${buttonHtml('Восстановить пароль', `${SITE_URL}/reset-password`)}
    `),
  };
}

export function orderStatusEmail(order: {
  order_number: string;
  customer_name: string;
  status: string;
  total: number;
}): { subject: string; html: string } | null {
  const statusMessages: Record<string, { title: string; subject: string; message: string }> = {
    confirmed: {
      title: 'Заказ подтверждён',
      subject: `Заказ ${order.order_number} подтверждён — RUSDOORS`,
      message: 'Ваш заказ подтверждён менеджером. Ожидайте информацию об оплате и доставке.',
    },
    paid: {
      title: 'Оплата получена',
      subject: `Оплата по заказу ${order.order_number} получена — RUSDOORS`,
      message: 'Оплата по вашему заказу успешно получена. Мы готовим его к отправке.',
    },
    shipping: {
      title: 'Заказ отправлен',
      subject: `Заказ ${order.order_number} отправлен — RUSDOORS`,
      message: 'Ваш заказ отправлен! Ожидайте доставку в ближайшее время.',
    },
    completed: {
      title: 'Заказ завершён',
      subject: `Заказ ${order.order_number} доставлен — RUSDOORS`,
      message: 'Ваш заказ успешно доставлен. Спасибо за покупку! Будем рады видеть вас снова.',
    },
    cancelled: {
      title: 'Заказ отменён',
      subject: `Заказ ${order.order_number} отменён — RUSDOORS`,
      message: 'К сожалению, ваш заказ был отменён. Если у вас есть вопросы, свяжитесь с нами.',
    },
  };

  const cfg = statusMessages[order.status];
  if (!cfg) return null;

  return {
    subject: cfg.subject,
    html: baseTemplate(cfg.title, `
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
        ${order.customer_name}, ${cfg.message.charAt(0).toLowerCase()}${cfg.message.slice(1)}
      </p>
      <div style="background:#f5f3ef;border-radius:12px;padding:16px 24px;margin:16px 0;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#999;">Заказ</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a1a;">${order.order_number}</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:600;color:#2d8bc9;">
          ${new Intl.NumberFormat('ru-RU').format(order.total)} ₽
        </p>
      </div>
      ${buttonHtml('Подробнее в кабинете', `${SITE_URL}/account`)}
    `),
  };
}

// ==================== SEND FUNCTION ====================

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EMAIL] SMTP not configured, skipping email to:', to);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send:', err);
    return false;
  }
}