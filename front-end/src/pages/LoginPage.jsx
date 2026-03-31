import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';

// MUI Components
import { 
  Box, Button, Container, TextField, Typography, Paper, 
  InputAdornment, IconButton, CircularProgress, Stack 
} from '@mui/material';

// MUI Icons
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';

// Membuat tema kustom dengan warna lembut (Soft Green & Blue)
const theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // Soft Blue
      light: '#e0f2fe',
    },
    secondary: {
      main: '#10b981', // Soft Green
      light: '#d1fae5',
    },
    background: {
      default: '#f8fafc', // Off-white/Slightly blueish gray
    },
    text: {
      primary: '#334155', // Slate-700 (bukan hitam pekat)
      secondary: '#64748b', // Slate-500
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 16,
  }
});

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal, silakan coba lagi.');
      }

      onLogin(data.token, data.user.role, data.user);

    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  const roles = [
    { id: 'admin', label: 'Admin' },
    { id: 'kasir', label: 'Cashier' },
    { id: 'customer', label: 'Customer' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* Left Section - Soft Gradient & Illustration */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            flex: 1, 
            background: 'linear-gradient(135deg, #d1fae5 0%, #e0f2fe 100%)', // Soft green to blue
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 6,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative background elements (soft neumorphism touch) */}
          <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 300, height: 300, bgcolor: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />

          <Box sx={{ zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
            <Box 
              sx={{ 
                width: 80, height: 80, 
                bgcolor: 'white', 
                borderRadius: '24px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                mx: 'auto', mb: 4,
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)'
              }}
            >
              <LocalHospitalRoundedIcon sx={{ fontSize: 40, color: '#10b981' }} />
            </Box>
            <Typography variant="h3" fontWeight="800" color="text.primary" gutterBottom sx={{ letterSpacing: '-1px' }}>
              Pemuda Farma
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
              Sistem manajemen apotek terpadu untuk pelayanan kesehatan yang lebih baik dan terpercaya.
            </Typography>
          </Box>
        </Box>

        {/* Right Section - Login Card */}
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: { xs: 3, md: 8 },
            bgcolor: 'background.default'
          }}
        >
          <Container maxWidth="sm" disableGutters>
            {/* Mobile Header (Hidden on Desktop) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 5 }}>
              <LocalHospitalRoundedIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="text.primary">Pemuda Farma</Typography>
            </Box>

            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 4, sm: 5 }, 
                borderRadius: '24px',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)', // Soft glassmorphism effect
                boxShadow: '0 20px 40px rgba(14, 165, 233, 0.08)', // Sangat subtle shadow
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Please sign in to your account.
              </Typography>

              {errors.api && (
                <Box sx={{ bgcolor: '#fee2e2', color: '#ef4444', p: 2, borderRadius: 2, mb: 3 }}>
                  <Typography variant="body2">{errors.api}</Typography>
                </Box>
              )}

              <form onSubmit={handleLogin}>
                
                {/* Custom Rounded Tabs for Role Selection */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    bgcolor: '#f1f5f9', 
                    borderRadius: '50px', 
                    p: 0.5, 
                    mb: 4 
                  }}
                >
                  {roles.map((r) => (
                    <Box
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 1.2,
                        borderRadius: '50px',
                        cursor: 'pointer',
                        bgcolor: role === r.id ? 'white' : 'transparent',
                        color: role === r.id ? 'primary.main' : 'text.secondary',
                        boxShadow: role === r.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Typography variant="body2" fontWeight={role === r.id ? 700 : 500}>
                        {r.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Form Inputs */}
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    placeholder={role === 'customer' ? 'Email or Username' : 'Username'}
                    variant="outlined"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      handleInputChange('username');
                    }}
                    error={!!errors.username}
                    helperText={errors.username}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        bgcolor: '#f8fafc',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: '#e2e8f0' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box>
                    <TextField
                      fullWidth
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        handleInputChange('password');
                      }}
                      error={!!errors.password}
                      helperText={errors.password}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '16px',
                          bgcolor: '#f8fafc',
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: '#e2e8f0' },
                          '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff sx={{ color: 'text.secondary' }} /> : <Visibility sx={{ color: 'text.secondary' }} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                      <Typography 
                        variant="body2" 
                        color="primary.main" 
                        sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.dark' } }}
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </Typography>
                    </Box>
                  </Box>

                  {/* Primary Button with Soft Gradient */}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{ 
                      py: 1.8, 
                      fontSize: '1rem', 
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)', // Soft Green to Blue
                      boxShadow: '0 8px 20px rgba(14, 165, 233, 0.25)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 25px rgba(14, 165, 233, 0.35)',
                      }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                  </Button>
                </Stack>
              </form>

              {role === 'customer' && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account? {' '}
                    <Typography 
                      component="span" 
                      variant="body2" 
                      color="primary.main" 
                      fontWeight={600}
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => navigate('/register-customer')}
                    >
                      Sign up here
                    </Typography>
                  </Typography>
                </Box>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;