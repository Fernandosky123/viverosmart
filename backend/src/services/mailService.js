const nodemailer = require('nodemailer');

async function sendPasswordResetEmail(email, url) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    console.info(`[SMTP no configurado] Enlace para ${email}: ${url}`);
    return { delivered: false };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM, to: email,
    subject: 'Recuperación de contraseña · ViveroSmart',
    text: `Solicitaste cambiar tu contraseña. Usa este enlace dentro de una hora: ${url}`,
    html: `<p>Solicitaste cambiar tu contraseña de ViveroSmart.</p><p><a href="${url}">Restablecer contraseña</a></p><p>Este enlace vence en una hora.</p>`
  });
  return { delivered: true };
}
module.exports = { sendPasswordResetEmail };
