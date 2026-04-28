import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, TextField, Typography,
  InputAdornment, IconButton, CircularProgress, Stack, Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488',
      light: '#5eead4',
      dark: '#0f766e',
    },
    secondary: {
      main: '#14b8a6',
      light: '#ccfbf1',
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

const benefits = [
  {
    icon: <HealthAndSafetyOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'Produk Terpercaya',
    desc: 'Obat & suplemen original bersertifikat BPOM',
  },
  {
    icon: <ShoppingBagOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'Belanja Mudah',
    desc: 'Pesan kapan saja, di mana saja dengan mudah',
  },
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'Pengiriman Cepat',
    desc: 'Dikirim langsung ke pintu rumah Anda',
  },
];

// Google SVG Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const CustomerLoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!identifier.trim()) newErrors.identifier = 'Email atau nomor handphone wajib diisi';
    if (!password) newErrors.password = 'Password wajib diisi';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password, role: 'customer' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login gagal, silakan coba lagi.');
      onLogin(data.token, data.user.role, data.user);
    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    // Placeholder: integrasikan dengan Google OAuth
    setTimeout(() => {
      setIsGoogleLoading(false);
      setErrors({ api: 'Login dengan Google belum dikonfigurasi. Hubungi administrator.' });
    }, 1500);
  };

  const handleInputChange = (field) => {
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

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
            background: 'linear-gradient(155deg, #134e4a 0%, #0f766e 30%, #0d9488 65%, #2dd4bf 100%)',
          }}
        >
          {/* decorative blobs */}
          <Box sx={{
            position: 'absolute', top: '-20%', right: '-20%',
            width: 550, height: 550,
            bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%',
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-15%', left: '-15%',
            width: 400, height: 400,
            bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%',
          }} />
          {/* Floating pill */}
          <Box sx={{
            position: 'absolute', top: '15%', right: '8%',
            width: 80, height: 80, borderRadius: '24px',
            bgcolor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            transform: 'rotate(12deg)',
          }} />
          <Box sx={{
            position: 'absolute', bottom: '18%', right: '12%',
            width: 50, height: 50, borderRadius: '14px',
            bgcolor: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            transform: 'rotate(-8deg)',
          }} />

          <Box sx={{ zIndex: 1, textAlign: 'center', maxWidth: 460 }}>
            {/* Logo */}
            <Box sx={{
              width: 88, height: 88, borderRadius: '28px', mx: 'auto', mb: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            }}>
              <LocalPharmacyRoundedIcon sx={{ fontSize: 50, color: '#ffffff' }} />
            </Box>

            <Typography
              variant="h3"
              fontWeight="800"
              sx={{
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                mb: 2.5,
                fontSize: { md: '1.9rem', lg: '2.3rem' },
              }}
            >
              Apotek Pemuda Farma
            </Typography>

            {/* Tagline Badge */}
            <Box sx={{
              display: 'inline-block',
              px: 3, py: 0.8,
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.2)',
              mb: 5,
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.85rem' }}>
                🛒 Toko Kesehatan Online Terpercaya
              </Typography>
            </Box>

            {/* Benefit Cards */}
            <Stack spacing={2.5}>
              {benefits.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2.5,
                    bgcolor: 'rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: '16px',
                    px: 3, py: 2,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.17)', transform: 'translateX(4px)' },
                  }}
                >
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#ffffff',
                  }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 700, mb: 0.3 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', mt: 6, color: 'rgba(255,255,255,0.4)' }}>
              © 2025 Apotek Pemuda Farma. Semua hak dilindungi.
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
              <Typography variant="caption" color="text.secondary">Toko Kesehatan Online</Typography>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ letterSpacing: '-0.5px', mb: 1 }}>
                Masuk ke Akun Anda 🌿
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Silakan masuk untuk mulai berbelanja kebutuhan kesehatan Anda.
              </Typography>
            </Box>

            {/* Google Login Button */}
            <Button
              id="customer-google-signin-btn"
              variant="outlined"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              startIcon={isGoogleLoading ? <CircularProgress size={18} color="inherit" /> : <GoogleIcon />}
              sx={{
                py: 1.6,
                mb: 3,
                borderRadius: '14px',
                borderColor: '#e2e8f0',
                borderWidth: '1.5px',
                color: '#374151',
                bgcolor: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  bgcolor: '#f8fafc',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'none' },
              }}
            >
              Masuk dengan Google
            </Button>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Divider sx={{ flex: 1, borderColor: '#f1f5f9' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500, px: 1 }}>
                atau masuk dengan email
              </Typography>
              <Divider sx={{ flex: 1, borderColor: '#f1f5f9' }} />
            </Box>

            {/* API Error */}
            {errors.api && (
              <Box sx={{
                bgcolor: '#fef2f2', color: '#dc2626', borderLeft: '4px solid #ef4444',
                p: 2.5, borderRadius: '12px', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Typography variant="body2" fontWeight={500}>{errors.api}</Typography>
              </Box>
            )}

            <form onSubmit={handleLogin} noValidate>
              <Stack spacing={3}>
                {/* Email / Phone */}
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    Email atau Nomor Handphone
                  </Typography>
                  <TextField
                    id="customer-identifier"
                    fullWidth
                    placeholder="email@contoh.com atau 08xxxxxxxxxx"
                    variant="outlined"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); handleInputChange('identifier'); }}
                    error={!!errors.identifier}
                    helperText={errors.identifier}
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
                    id="customer-password"
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
                            id="customer-toggle-password"
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
                      onClick={() => navigate('/lupa-password')}
                      sx={{
                        color: '#0d9488', fontWeight: 600, cursor: 'pointer',
                        '&:hover': { color: '#0f766e', textDecoration: 'underline' },
                        transition: 'color 0.2s',
                      }}
                    >
                      Lupa Password?
                    </Typography>
                  </Box>
                </Box>

                {/* Masuk Button */}
                <Button
                  id="customer-signin-btn"
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
                    : 'Masuk / Sign In'}
                </Button>
              </Stack>
            </form>

            {/* Register Link */}
            <Box
              sx={{
                mt: 4, p: 3,
                bgcolor: '#f0fdfa',
                border: '1.5px solid #99f6e4',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Belum punya akun?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  onClick={() => navigate('/register-customer')}
                  sx={{
                    color: '#0d9488', fontWeight: 700, cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline', color: '#0f766e' },
                    transition: 'color 0.2s',
                  }}
                >
                  Daftar di sini
                </Typography>
              </Typography>
            </Box>

            {/* Link to staff login */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography
                variant="body2"
                onClick={() => navigate('/login')}
                sx={{
                  color: '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem',
                  '&:hover': { color: '#0d9488' },
                }}
              >
                🔐 Portal Karyawan? Masuk di sini
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CustomerLoginPage;
