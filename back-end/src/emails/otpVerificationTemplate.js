/**
 * Email template for OTP verification codes.
 *
 * @param {string} code   - The OTP code (e.g. "482917")
 * @param {'change-email'|'change-password'} action - The action being verified
 * @returns {string} HTML string for the email body
 */
const otpVerificationTemplate = (code, action) => {
  const actionLabel = action === 'change-email' ? 'mengubah email' : 'mengubah password';

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kode Verifikasi - Apotek Pemuda Farma</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f766e 0%, #0e7490 100%); padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
                💊 Apotek Pemuda Farma
              </h1>
              <p style="margin: 8px 0 0; color: #ccfbf1; font-size: 14px;">
                Kode Verifikasi Keamanan
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="color: #334155; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
                Halo,<br/>
                Anda meminta untuk <strong>${actionLabel}</strong> akun Anda. Gunakan kode berikut untuk memverifikasi permintaan ini:
              </p>

              <!-- OTP Code Box -->
              <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%); border: 2px dashed #99f6e4; border-radius: 14px; padding: 18px 36px;">
                  <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #0f766e; font-family: 'Courier New', monospace;">
                    ${code}
                  </span>
                </div>
              </div>

              <!-- Timer Warning -->
              <div style="background: #fefce8; border-left: 4px solid #facc15; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
                <p style="margin: 0; color: #854d0e; font-size: 13px; font-weight: 600;">
                  ⏱️ Kode ini berlaku selama <strong>5 menit</strong>
                </p>
                <p style="margin: 6px 0 0; color: #a16207; font-size: 12px;">
                  Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari Apotek Pemuda.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                Jika Anda tidak meminta perubahan ini, abaikan email ini.<br/>
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

module.exports = otpVerificationTemplate;
