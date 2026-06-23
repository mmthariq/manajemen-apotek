import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import {
  Box, Button, Container, TextField, Typography, Paper,
  InputAdornment, IconButton, CircularProgress, Stack, Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488',   // teal-600
      light: '#5eead4', // teal-300
      dark: '#0f766e',  // teal-700
    },
    secondary: {
      main: '#14b8a6',   // teal-500
      light: '#ccfbf1', // teal-100
    },
    background: {
      default: '#f8fafc',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
});

const featureItems = [
  { icon: <InventoryOutlinedIcon sx={{ fontSize: 22 }} />, label: 'Manajemen Stok & Obat' },
  { icon: <MedicalServicesOutlinedIcon sx={{ fontSize: 22 }} />, label: 'Transaksi & Penjualan' },
  { icon: <AssessmentOutlinedIcon sx={{ fontSize: 22 }} />, label: 'Laporan & Analitik' },
];

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Email atau username wajib diisi';
    if (!password) newErrors.password = 'Password wajib diisi';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Backend mewajibkan field `role`. Karena UI tidak menampilkan role selector,
    // kita coba ketiga role internal secara otomatis hingga salah satu berhasil.
    const internalRoles = ['admin', 'kasir', 'owner'];

    try {
      let lastError = 'Login gagal, silakan coba lagi.';
      for (const role of internalRoles) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: username, password, role }),
        });
        const data = await response.json();

        if (response.ok) {
          // Login berhasil dengan role ini
          onLogin(data.token, data.user.role, data.user);
          return;
        }

        // Simpan pesan error terakhir (selain "role tidak valid")
        if (data.message && !data.message.toLowerCase().includes('role')) {
          lastError = data.message;
        }
      }
      // Semua role gagal
      throw new Error(lastError);
    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field) => {
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>

        {/* ── LEFT PANEL ── */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 8,
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'url(/images/apotek.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Dark teal overlay agar teks terbaca jelas di atas foto */}
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(145deg, rgba(9,78,72,0.82) 0%, rgba(13,148,136,0.72) 60%, rgba(20,184,166,0.55) 100%)',
            zIndex: 0,
          }} />

          {/* decorative blobs */}
          <Box sx={{
            position: 'absolute', top: '-15%', right: '-15%',
            width: 500, height: 500,
            bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '50%',
            zIndex: 0,
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-10%', left: '-10%',
            width: 380, height: 380,
            bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '50%',
            zIndex: 0,
          }} />

          <Box sx={{ zIndex: 1, textAlign: 'center', maxWidth: 480 }}>
            {/* Logo */}
            <Box sx={{
              width: 88, height: 88, borderRadius: '24px', mx: 'auto', mb: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>
              <LocalPharmacyRoundedIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>

            <Typography
              variant="h3"
              fontWeight="800"
              sx={{
                color: '#fff',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                mb: 2,
                fontSize: { md: '2rem', lg: '2.4rem' },
              }}
            >
              Apotek Pemuda<br />Farma
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 6, lineHeight: 1.7, fontSize: '0.95rem' }}>
              Sistem manajemen apotek terintegrasi untuk operasional yang lebih efisien dan akurat.
            </Typography>

            {/* Feature Chips */}
            <Stack spacing={2}>
              {featureItems.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '14px',
                    px: 3, py: 1.8,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
                  }}
                >
                  <Box sx={{ color: 'rgba(255,255,255,0.9)' }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', mt: 6, color: 'rgba(255,255,255,0.45)' }}>
              © 2025 Apotek Pemuda Farma. All rights reserved.
            </Typography>
          </Box>
        </Box>

        {/* ── RIGHT PANEL ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 3, sm: 5, md: 8 },
            bgcolor: '#ffffff',
          }}
        >
          <Container maxWidth="sm" disableGutters>
            {/* Mobile logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 6 }}>
              <Box sx={{
                width: 64, height: 64, borderRadius: '18px', mb: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)',
              }}>
                <LocalPharmacyRoundedIcon sx={{ fontSize: 34, color: '#fff' }} />
              </Box>
              <Typography variant="h6" fontWeight="700" color="text.primary">
                Apotek Pemuda Farma
              </Typography>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ letterSpacing: '-0.5px', mb: 1 }}>
                Welcome Back 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Masuk untuk mengelola dashboard internal Apotek Pemuda Farma.
              </Typography>
            </Box>

            {/* API Error */}
            {errors.api && (
              <Box sx={{
                bgcolor: '#fef2f2', color: '#dc2626', borderLeft: '4px solid #ef4444',
                p: 2.5, borderRadius: '12px', mb: 4, display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Typography variant="body2" fontWeight={500}>{errors.api}</Typography>
              </Box>
            )}

            <form onSubmit={handleLogin} noValidate>
              <Stack spacing={3}>
                {/* Username / Email */}
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    Email atau Username
                  </Typography>
                  <TextField
                    id="staff-username"
                    fullWidth
                    placeholder="Masukkan email atau username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); handleInputChange('username'); }}
                    error={!!errors.username}
                    helperText={errors.username}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '14px',
                        bgcolor: '#f8fafc',
                        transition: 'all 0.2s',
                        '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: '#0d9488', borderWidth: '2px' },
                        '&.Mui-focused': { bgcolor: '#f0fdfa' },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Password */}
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    Password
                  </Typography>
                  <TextField
                    id="staff-password"
                    fullWidth
                    placeholder="Masukkan password Anda"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); handleInputChange('password'); }}
                    error={!!errors.password}
                    helperText={errors.password}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '14px',
                        bgcolor: '#f8fafc',
                        transition: 'all 0.2s',
                        '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: '#0d9488', borderWidth: '2px' },
                        '&.Mui-focused': { bgcolor: '#f0fdfa' },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            id="staff-toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#94a3b8', '&:hover': { color: '#0d9488' } }}
                          >
                            {showPassword
                              ? <VisibilityOff sx={{ fontSize: 20 }} />
                              : <Visibility sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Forgot password link */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.2 }}>
                    <Typography
                      variant="body2"
                      onClick={() => setShowForgotPassword(true)}
                      sx={{
                        color: '#0d9488', fontWeight: 600, cursor: 'pointer',
                        '&:hover': { color: '#0f766e', textDecoration: 'underline' },
                        transition: 'color 0.2s',
                      }}
                    >
                      Forgot Password?
                    </Typography>
                  </Box>
                </Box>

                {/* Sign In Button */}
                <Button
                  id="staff-signin-btn"
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
                    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0d6561 0%, #0b8077 50%, #0fa89a 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(13, 148, 136, 0.45)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&.Mui-disabled': { opacity: 0.65, transform: 'none' },
                  }}
                >
                  {isLoading
                    ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.85)' }} />
                    : 'Sign In'}
                </Button>
              </Stack>
            </form>

            {/* Divider & back to home */}
            <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Bukan portal pegawai?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  onClick={() => navigate('/customer-login')}
                  sx={{
                    color: '#0d9488', fontWeight: 600, cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Login sebagai Customer
                </Typography>
              </Typography>
              <Typography
                variant="body2"
                onClick={() => navigate('/')}
                sx={{
                  color: '#94a3b8', mt: 1.5, cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem',
                  '&:hover': { color: '#0d9488' },
                }}
              >
                ← Kembali ke halaman utama
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;