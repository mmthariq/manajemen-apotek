/**
 * Email template for successful email change notification.
 * Sent to the OLD email to inform the user their email was changed.
 *
 * @param {string} oldEmail - The previous email address
 * @param {string} newEmail - The newly set email address
 * @returns {string} HTML string for the email body
 */
const emailChangedNotificationTemplate = (oldEmail, newEmail) => {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Berhasil Diubah - Apotek Pemuda Farma</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f766e 0%, #0e7490 100%); padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                💊 Apotek Pemuda Farma
              </h1>
              <p style="margin: 8px 0 0; color: #ccfbf1; font-size: 14px;">
                Pemberitahuan Perubahan Email
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #dcfce7; font-size: 28px;">✅</span>
              </div>

              <h2 style="color: #0f766e; text-align: center; margin: 0 0 16px; font-size: 20px;">
                Email Berhasil Diubah
              </h2>

              <p style="color: #334155; margin: 0 0 20px; font-size: 15px; line-height: 1.6; text-align: center;">
                Email akun Anda telah berhasil diperbarui.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border-radius: 10px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email Lama</span>
                    <p style="margin: 4px 0 0; color: #ef4444; font-size: 15px; font-weight: 600; text-decoration: line-through;">${oldEmail}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email Baru</span>
                    <p style="margin: 4px 0 0; color: #0f766e; font-size: 15px; font-weight: 600;">${newEmail}</p>
                  </td>
                </tr>
              </table>

              <!-- Security Warning -->
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">
                  ⚠️ Bukan Anda yang melakukan perubahan ini?
                </p>
                <p style="margin: 6px 0 0; color: #b91c1c; font-size: 12px;">
                  Segera hubungi tim kami untuk mengamankan akun Anda.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Apotek Pemuda Farma. Semua hak dilindungi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = emailChangedNotificationTemplate;
