import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import { 
  Box, Button, Container, TextField, Typography, Paper, 
  InputAdornment, IconButton, CircularProgress, Stack,
  Snackbar, Alert, Grid, Checkbox, FormControlLabel, Link
} from '@mui/material';

// MUI Icons
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

// Tema yang sama dengan LoginPage
const theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // Soft Blue
    },
    secondary: {
      main: '#10b981', // Soft Green
    },
    background: {
      default: '#f8fafc', 
    },
    text: {
      primary: '#334155', 
      secondary: '#64748b', 
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

const CustomerRegistration = ({ onRegistrationSuccess }) => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // State untuk toggle mata password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: nextValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sesuai';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon harus diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat harus diisi';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Anda harus menyetujui Terms of Service dan Privacy Policy';

    return newErrors;
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setShowNotification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotificationMessage('Mohon periksa kembali form Anda', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Terjadi kesalahan saat registrasi');
      }

      setIsRegistered(true);
      showNotificationMessage('Pendaftaran berhasil!', 'success');
      
      if (onRegistrationSuccess) {
        onRegistrationSuccess(result.data);
      }
    } catch (error) {
      showNotificationMessage(error.message || 'Terjadi kesalahan saat registrasi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Gaya input global agar seragam
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      bgcolor: '#f8fafc',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: '#e2e8f0' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* Left Section - Gradient & Branding */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            flex: 1, 
            background: 'linear-gradient(135deg, #d1fae5 0%, #e0f2fe 100%)',
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 6,
            position: 'fixed', // Agar tidak ikut scroll jika form di kanan panjang
            width: '50%',
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          {/* Decorative blur elements */}
          <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 300, height: 300, bgcolor: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />

          <Box sx={{ zIndex: 1, textAlign: 'center', maxWidth: 450 }}>
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
              <VerifiedUserRoundedIcon sx={{ fontSize: 40, color: '#10b981' }} />
            </Box>
            <Typography variant="h3" fontWeight="800" color="text.primary" gutterBottom sx={{ letterSpacing: '-1px' }}>
              Gabung Sekarang
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6, mb: 4 }}>
              Daftarkan diri Anda untuk kemudahan berbelanja obat secara online dan nikmati layanan dari apoteker kami.
            </Typography>
            
            <Stack spacing={2} sx={{ textAlign: 'left', display: 'inline-flex' }}>
              {['Ribuan produk obat berkualitas', 'Pengiriman cepat dan aman', 'Poin reward setiap pembelian'].map((benefit, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ color: '#10b981' }} />
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>{benefit}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Right Section - Form / Success Status */}
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, md: 6 },
            marginLeft: { xs: 0, md: '50%' }, // Kompensasi form di kanan karena kiri position fixed
            minHeight: '100vh'
          }}
        >
          <Container maxWidth="sm" disableGutters>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 4, sm: 5 }, 
                borderRadius: '24px',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            >
              
              {!isRegistered ? (
                // --- FORM REGISTRASI ---
                <>
                  <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Buat Akun Baru
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Lengkapi data diri Anda di bawah ini.
                  </Typography>

                  <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                      <TextField
                        fullWidth
                        name="name"
                        placeholder="Nama Lengkap"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        sx={inputStyles}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><PersonOutlineOutlinedIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                        }}
                      />

                      <TextField
                        fullWidth
                        name="email"
                        placeholder="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={inputStyles}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                        }}
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="password"
                            placeholder="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            sx={inputStyles}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                    {showPassword ? <VisibilityOff sx={{ color: 'text.secondary' }} /> : <Visibility sx={{ color: 'text.secondary' }} />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="confirmPassword"
                            placeholder="Ulangi Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            sx={inputStyles}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                                    {showConfirmPassword ? <VisibilityOff sx={{ color: 'text.secondary' }} /> : <Visibility sx={{ color: 'text.secondary' }} />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        name="phone"
                        placeholder="Nomor Telepon"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        sx={inputStyles}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                        }}
                      />

                      <TextField
                        fullWidth
                        name="address"
                        placeholder="Alamat Lengkap"
                        multiline
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        error={!!errors.address}
                        helperText={errors.address}
                        sx={{...inputStyles, '& .MuiOutlinedInput-root': { ...inputStyles['& .MuiOutlinedInput-root'], padding: '12px 14px' } }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0.5 }}><HomeOutlinedIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                        }}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{ 
                          py: 1.8, 
                          mt: 2,
                          fontSize: '1rem', 
                          borderRadius: '50px',
                          background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                          boxShadow: '0 8px 20px rgba(14, 165, 233, 0.25)',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 25px rgba(14, 165, 233, 0.35)',
                          }
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                      </Button>

                      <FormControlLabel
                        sx={{ mt: 0.5 }}
                        control={(
                          <Checkbox
                            checked={formData.acceptTerms}
                            onChange={handleInputChange}
                            name="acceptTerms"
                            color="primary"
                          />
                        )}
                        label={(
                          <Typography variant="body2" color="text.secondary">
                            Saya menyetujui{' '}
                            <Link href="#" underline="hover" color="primary.main">Terms of Service</Link>
                            {' '}dan{' '}
                            <Link href="#" underline="hover" color="primary.main">Privacy Policy</Link>
                          </Typography>
                        )}
                      />
                      {errors.acceptTerms && (
                        <Typography variant="caption" color="error" sx={{ mt: -1 }}>
                          {errors.acceptTerms}
                        </Typography>
                      )}
                    </Stack>
                  </form>

                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Sudah memiliki akun? {' '}
                      <Typography 
                        component="span" 
                        variant="body2" 
                        color="primary.main" 
                        fontWeight={600}
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => navigate('/Login')}
                      >
                        Masuk di sini
                      </Typography>
                    </Typography>
                  </Box>
                </>
              ) : (
                // --- SUCCESS STATE ---
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Box 
                    sx={{ 
                      width: 80, height: 80, 
                      borderRadius: '50%', 
                      bgcolor: '#d1fae5', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      mx: 'auto', mb: 3
                    }}
                  >
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 50, color: '#10b981' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Pendaftaran Berhasil! 🎉
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, px: {xs: 0, sm: 2} }}>
                    Akun untuk email <strong>{formData.email}</strong> sudah berhasil dibuat.
                  </Typography>

                  <Box sx={{ bgcolor: '#f1f5f9', p: 3, borderRadius: 4, mb: 4, textAlign: 'left' }}>
                    <Typography variant="subtitle2" color="text.primary" fontWeight="bold" gutterBottom>
                      Langkah Selanjutnya:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <span style={{ color: '#10b981' }}>✓</span> Akun Anda telah berhasil dibuat.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ color: '#10b981' }}>✓</span> Silakan login untuk mulai berbelanja.
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/')}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: '50px',
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: '#e0f2fe'
                      }
                    }}
                  >
                    Kembali ke Halaman Login
                  </Button>
                </Box>
              )}

            </Paper>
          </Container>
        </Box>
      </Box>

      {/* Snackbar untuk Notifikasi */}
      <Snackbar 
        open={showNotification} 
        autoHideDuration={4000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notificationType} 
          variant="filled"
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default CustomerRegistration;