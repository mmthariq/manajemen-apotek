const nodemailer = require('nodemailer');

/**
 * Creates an SMTP transporter using environment variables.
 * Supports Gmail, Mailtrap, or any SMTP provider.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using the SMTP transporter.
 *
 * @param {Object} options
 * @param {string} options.to     - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text   - Plain text body (fallback)
 * @param {string} options.html   - HTML body
 */
const sendMail = async ({ to, subject, text, html }) => {
  const fromName = process.env.SMTP_FROM_NAME || 'Apotek Pemuda Farma';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[MAILER] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { transporter, sendMail };
