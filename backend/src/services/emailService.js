export const sendOrderConfirmationEmail = async (order, user, items) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!apiKey || !senderEmail) {
    console.warn('No fue posible enviar el correo de confirmación: faltan variables de entorno.');
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

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail },
      to: [
        {
          email: 'alejandrotrujillo9696@gmail.com',
        },
      ],
      subject: `Nueva compra #${order.id}`,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    console.error('No fue posible enviar el correo de confirmación de compra:', response.status, errorText);
    throw new Error(
      `No fue posible enviar el correo de confirmación de compra: ${response.status}`
    );
  }
};
