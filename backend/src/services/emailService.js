import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendOrderConfirmationEmail = async (order, user, items) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('No fue posible enviar el correo de confirmación: faltan variables de entorno de SMTP.');
    return;
  }

  const productLines = items
    .map(
      (item) =>
        `- ${item.name} x${item.quantity} — $${Number(item.price).toFixed(2)} c/u`
    )
    .join('\n');

  const html = `
    <h1>Nueva compra realizada</h1>
    <p><strong>Pedido:</strong> #${order.id}</p>
    <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString()}</p>
    <p><strong>Comprador:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
    <p><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
    <p><strong>Estado:</strong> ${order.status}</p>
    <h2>Productos</h2>
    <pre>${productLines}</pre>
    <p><strong>Envío:</strong> ${order.shipping_name}, ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_zip}, ${order.shipping_phone}</p>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: 'alejandrotrujillo9696@gmail.com',
    subject: `Nueva compra #${order.id}`,
    html,
  });
};