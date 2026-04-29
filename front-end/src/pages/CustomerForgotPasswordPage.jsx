import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, TextField, Typography,
  InputAdornment, IconButton, CircularProgress, Stack, Alert
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PinOutlinedIcon from '@mui/icons-material/PinOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

const theme = createTheme({
  palette: {
    primary: { main: '#0d9488', light: '#5eead4', dark: '#0f766e' },
    secondary: { main: '#14b8a6', light: '#ccfbf1' },
    background: { default: '#f8fafc' },
    text: { primary: '#1e293b', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
});

const STEPS = { EMAIL: 0, OTP: 1, NEW_PASSWORD: 2, SUCCESS: 3 };

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px', bgcolor: '#f8fafc', transition: 'all 0.2s',
    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#94a3b8' },
    '&.Mui-focused fieldset': { borderColor: '#0d9488', borderWidth: '2px' },
    '&.Mui-focused': { bgcolor: '#f0fdfa' },
  },
};

const CustomerForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const API = 'http://localhost:3000/api/auth';

  // Step 1 — send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInfo(data.message);
      setStep(STEPS.OTP);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setError('Kode verifikasi wajib diisi.'); return; }
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API}/verify-reset-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInfo(data.message);
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  // Step 3 — reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (newPassword !== confirmPassword) { setError('Konfirmasi password tidak cocok.'); return; }
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep(STEPS.SUCCESS);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleResendOtp = async () => {
    setIsLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInfo('Kode verifikasi baru telah dikirim ke email Anda.');
      setOtp('');
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const stepTitles = {
    [STEPS.EMAIL]: { title: 'Lupa Password? 🔑', sub: 'Masukkan email Anda untuk menerima kode verifikasi reset password.' },
    [STEPS.OTP]: { title: 'Verifikasi Kode 📩', sub: `Masukkan kode 6 digit yang telah dikirim ke ${email}` },
    [STEPS.NEW_PASSWORD]: { title: 'Password Baru 🔒', sub: 'Buat password baru untuk akun Anda.' },
    [STEPS.SUCCESS]: { title: 'Berhasil! 🎉', sub: 'Password Anda telah berhasil direset.' },
  };

  const stepIndicator = (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={{
          width: step > i ? 32 : 12, height: 6, borderRadius: 3,
          bgcolor: step >= i ? '#0d9488' : '#e2e8f0',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>

        {/* LEFT PANEL */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' }, flex: 1, flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', p: 8, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(155deg, #134e4a 0%, #0f766e 30%, #0d9488 65%, #2dd4bf 100%)',
        }}>
          <Box sx={{ position: 'absolute', top: '-20%', right: '-20%', width: 550, height: 550, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <Box sx={{ position: 'absolute', bottom: '-15%', left: '-15%', width: 400, height: 400, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <Box sx={{ zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
            <Box sx={{
              width: 88, height: 88, borderRadius: '28px', mx: 'auto', mb: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            }}>
              <LocalPharmacyRoundedIcon sx={{ fontSize: 50, color: '#fff' }} />
            </Box>
            <Typography variant="h3" fontWeight="800" sx={{ color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, mb: 2.5, fontSize: { md: '1.9rem', lg: '2.3rem' } }}>
              Apotek Pemuda Farma
            </Typography>
            <Box sx={{ display: 'inline-block', px: 3, py: 0.8, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', mb: 4 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.85rem' }}>
                🔐 Pemulihan Akun Aman
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '16px', px: 3, py: 2.5, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, fontSize: '0.88rem' }}>
                Kami akan mengirimkan kode verifikasi ke email terdaftar Anda. Kode ini berlaku selama <strong>5 menit</strong> dan hanya bisa digunakan satu kali.
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 6, color: 'rgba(255,255,255,0.4)' }}>
              © 2025 Apotek Pemuda Farma. Semua hak dilindungi.
            </Typography>
          </Box>
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 3, sm: 5, md: 8 }, bgcolor: '#ffffff' }}>
          <Container maxWidth="sm" disableGutters>

            {/* Mobile logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', boxShadow: '0 8px 20px rgba(13,148,136,0.3)' }}>
                <LocalPharmacyRoundedIcon sx={{ fontSize: 30, color: '#fff' }} />
              </Box>
              <Typography variant="body1" fontWeight="700" color="text.primary">Apotek Pemuda Farma</Typography>
            </Box>

            {/* Back button */}
            {step !== STEPS.SUCCESS && (
              <Button
                id="forgot-pw-back-btn"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => step === STEPS.EMAIL ? navigate('/customer-login') : setStep(step - 1)}
                sx={{ mb: 3, color: '#64748b', fontWeight: 600, '&:hover': { bgcolor: '#f1f5f9', color: '#0d9488' } }}
              >
                {step === STEPS.EMAIL ? 'Kembali ke Login' : 'Kembali'}
              </Button>
            )}

            {step !== STEPS.SUCCESS && stepIndicator}

            {/* Title */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ letterSpacing: '-0.5px', mb: 1 }}>
                {stepTitles[step].title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {stepTitles[step].sub}
              </Typography>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
            {info && step !== STEPS.SUCCESS && <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setInfo('')}>{info}</Alert>}

            {/* === STEP: EMAIL === */}
            {step === STEPS.EMAIL && (
              <form onSubmit={handleSendOtp} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>Alamat Email</Typography>
                    <TextField id="forgot-pw-email" fullWidth placeholder="email@contoh.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} sx={inputSx}
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                    />
                  </Box>
                  <Button id="forgot-pw-send-btn" type="submit" variant="contained" fullWidth disabled={isLoading}
                    sx={{ py: 1.8, fontSize: '1rem', borderRadius: '14px', background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)', boxShadow: '0 8px 24px rgba(13,148,136,0.35)', '&:hover': { background: 'linear-gradient(135deg, #0d6561, #0b8077, #0fa89a)', transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(13,148,136,0.45)' }, '&:active': { transform: 'none' } }}
                  >
                    {isLoading ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.85)' }} /> : 'Kirim Kode Verifikasi'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* === STEP: OTP === */}
            {step === STEPS.OTP && (
              <form onSubmit={handleVerifyOtp} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>Kode Verifikasi (6 Digit)</Typography>
                    <TextField id="forgot-pw-otp" fullWidth placeholder="Masukkan 6 digit kode" value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} sx={inputSx}
                      inputProps={{ maxLength: 6, style: { letterSpacing: '8px', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center' } }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PinOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                    />
                  </Box>
                  <Button id="forgot-pw-verify-btn" type="submit" variant="contained" fullWidth disabled={isLoading || otp.length < 6}
                    sx={{ py: 1.8, fontSize: '1rem', borderRadius: '14px', background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)', boxShadow: '0 8px 24px rgba(13,148,136,0.35)', '&:hover': { background: 'linear-gradient(135deg, #0d6561, #0b8077, #0fa89a)', transform: 'translateY(-2px)' }, '&:active': { transform: 'none' } }}
                  >
                    {isLoading ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.85)' }} /> : 'Verifikasi Kode'}
                  </Button>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tidak menerima kode?{' '}
                      <Typography component="span" variant="body2" onClick={handleResendOtp}
                        sx={{ color: '#0d9488', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                        Kirim ulang
                      </Typography>
                    </Typography>
                  </Box>
                </Stack>
              </form>
            )}

            {/* === STEP: NEW PASSWORD === */}
            {step === STEPS.NEW_PASSWORD && (
              <form onSubmit={handleResetPassword} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>Password Baru</Typography>
                    <TextField id="forgot-pw-new" fullWidth placeholder="Minimal 6 karakter" type={showPw ? 'text' : 'password'}
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={inputSx}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPw(!showPw)} edge="end" sx={{ color: '#94a3b8' }}>{showPw ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}</IconButton></InputAdornment>,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>Konfirmasi Password</Typography>
                    <TextField id="forgot-pw-confirm" fullWidth placeholder="Ketik ulang password baru" type={showCpw ? 'text' : 'password'}
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={inputSx}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowCpw(!showCpw)} edge="end" sx={{ color: '#94a3b8' }}>{showCpw ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}</IconButton></InputAdornment>,
                      }}
                    />
                  </Box>
                  <Button id="forgot-pw-reset-btn" type="submit" variant="contained" fullWidth disabled={isLoading}
                    sx={{ py: 1.8, fontSize: '1rem', borderRadius: '14px', background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)', boxShadow: '0 8px 24px rgba(13,148,136,0.35)', '&:hover': { background: 'linear-gradient(135deg, #0d6561, #0b8077, #0fa89a)', transform: 'translateY(-2px)' }, '&:active': { transform: 'none' } }}
                  >
                    {isLoading ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.85)' }} /> : 'Reset Password'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* === STEP: SUCCESS === */}
            {step === STEPS.SUCCESS && (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#f0fdfa', mx: 'auto', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 48, color: '#0d9488' }} />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                  Password Anda berhasil direset. Silakan masuk dengan password baru.
                </Typography>
                <Button id="forgot-pw-login-btn" variant="contained" fullWidth onClick={() => navigate('/customer-login')}
                  sx={{ py: 1.8, fontSize: '1rem', borderRadius: '14px', background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)', boxShadow: '0 8px 24px rgba(13,148,136,0.35)', '&:hover': { background: 'linear-gradient(135deg, #0d6561, #0b8077, #0fa89a)', transform: 'translateY(-2px)' }, '&:active': { transform: 'none' } }}
                >
                  Masuk ke Akun
                </Button>
              </Box>
            )}

          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CustomerForgotPasswordPage;
