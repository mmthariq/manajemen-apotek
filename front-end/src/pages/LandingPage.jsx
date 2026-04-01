import { Link } from 'react-router-dom';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import {
  Inventory2Rounded,
  InsertChartRounded,
  LocalShippingRounded,
  ArrowForwardRounded,
  HealthAndSafetyRounded
} from '@mui/icons-material';
import '../styles/LandingPage.css';

const LandingPage = ({ isAuthenticated, redirectPath }) => {
  const primaryCtaPath = isAuthenticated ? redirectPath : '/login';
  const primaryCtaLabel = isAuthenticated ? 'Masuk ke Dashboard' : 'Mulai Sistem Sekarang';

  const featurePreviewItems = [
    {
      title: 'Manajemen Stok Otomatis',
      description: 'Sinkronisasi stok masuk, keluar, dan peringatan minimum stok secara real-time.',
      icon: <Inventory2Rounded fontSize="large" sx={{ color: '#10b981' }} />,
    },
    {
      title: 'Dashboard Penjualan',
      description: 'Pantau performa harian hingga bulanan dalam satu tampilan grafis yang ringkas.',
      icon: <InsertChartRounded fontSize="large" sx={{ color: '#0ea5e9' }} />,
    },
    {
      title: 'Integrasi Supplier',
      description: 'Kelola data supplier dan histori pemesanan dengan jauh lebih terstruktur.',
      icon: <LocalShippingRounded fontSize="large" sx={{ color: '#8b5cf6' }} />,
    },
  ];

  return (
    <Box className="landing-root">
      <Box className="landing-aurora landing-aurora-left" />
      <Box className="landing-aurora landing-aurora-right" />

      <Container maxWidth="lg" className="landing-container">
        {/* 1. Navigasi - Tombol 'Daftar Customer' di sini sudah dihapus */}
        <Box className="landing-nav">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box className="landing-brand-emblem" aria-hidden="true">
              <Box className="landing-brand-emblem-ring" />
              <HealthAndSafetyRounded sx={{ color: '#ffffff', fontSize: 22 }} />
              <Box className="landing-brand-emblem-dot" />
            </Box>
            <Typography className="landing-brand" variant="h6">
              Apotek Pemuda Farma
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button component={Link} to="/login" variant="outlined" className="landing-nav-btn-outline">
              Login
            </Button>
          </Stack>
        </Box>

        {/* 2. Hero Section - Tombol tetap ada */}
        <Box className="landing-hero-grid">
          <Box className="landing-copy">
            <Chip label="Transformasi Digital Apotek" className="landing-chip" size="small" />
            <Typography variant="h2" className="landing-title">
              Solusi Apotek <span className="text-gradient">Cepat, Rapi,</span> dan Terintegrasi.
            </Typography>
            <Typography variant="body1" className="landing-subtitle">
              Tinggalkan cara manual. Kelola stok obat, transaksi harian, data supplier, hingga laporan penjualan dalam satu dashboard cerdas untuk Apotek Pemuda Farma.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="landing-cta-wrap">
              <Button 
                component={Link} 
                to={primaryCtaPath} 
                variant="contained" 
                className="landing-cta-primary"
                endIcon={<ArrowForwardRounded />}
              >
                {primaryCtaLabel}
              </Button>
              <Button component={Link} to="/register-customer" variant="outlined" className="landing-cta-secondary">
                Daftar Member
              </Button>
            </Stack>
          </Box>

          <Box className="landing-visual-card">
            <img
              src="/images/apoteklanding.png"
              alt="Area pelayanan Apotek Pemuda Farma"
              className="landing-visual-image"
              onError={(e) => {
                e.currentTarget.src = '/images/apotek.jpg';
              }}
            />
          </Box>
        </Box>

        {/* Fitur Section */}
        <Box className="landing-section-block">
          <Box className="landing-section-head">
            <Typography variant="h4" className="landing-section-title">
              Fitur Unggulan Sistem
            </Typography>
            <Typography variant="body1" className="landing-section-subtitle">
              Rangkaian fitur yang dirancang khusus untuk mempermudah operasional apotek Anda.
            </Typography>
          </Box>

          <Box className="landing-feature-grid">
            {featurePreviewItems.map((item) => (
              <Box key={item.title} className="landing-feature-card">
                <Box className="landing-feature-icon-wrapper">
                  {item.icon}
                </Box>
                <Typography variant="h6" className="landing-feature-title">
                  {item.title}
                </Typography>
                <Typography variant="body2" className="landing-feature-desc">
                  {item.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* 3. Section Bawah - Tombol tetap ada */}
        <Box className="landing-section-block landing-testimonial-block">
          <Box className="landing-testimonial-content">
            <Typography variant="h4" className="landing-section-title">
              Jadilah Bagian dari Perubahan
            </Typography>
            <Typography variant="body1" className="landing-section-subtitle" sx={{ mb: 3 }}>
              Sistem kami sedang dalam tahap penyempurnaan akhir. Segera daftarkan diri Anda dan jadilah yang pertama memberikan testimoni tentang kemudahan operasional bersama kami.
            </Typography>
            <Button component={Link} to="/register-customer" variant="contained" className="landing-cta-primary">
              Gabung Sebagai Customer Pertama
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="landing-footer">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" className="landing-footer-brand">
                Apotek Pemuda Farma
              </Typography>
              <Typography variant="body2" className="landing-footer-text">
                Jl. Pemuda, Bojonegoro • Senin - Sabtu, 08.00 - 21.00
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="body2" className="landing-footer-text">
                Kontak: 08xx-xxxx-xxxx
              </Typography>
              <Typography variant="body2" className="landing-footer-text">
                Email: info@pemudafarma.id
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;