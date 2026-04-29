import { Link } from 'react-router-dom';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import {
  Inventory2Rounded,
  InsertChartRounded,
  LocalShippingRounded,
  ArrowForwardRounded,
  HealthAndSafetyRounded,
  AdminPanelSettingsRounded,
  PointOfSaleRounded,
  ShoppingCartRounded,
  AssessmentRounded,
} from '@mui/icons-material';
import '../styles/LandingPage.css';

const LandingPage = ({ isAuthenticated, redirectPath }) => {
  const primaryCtaPath = isAuthenticated ? redirectPath : '/login';
  const primaryCtaLabel = isAuthenticated ? 'Masuk ke Dashboard' : 'Masuk ke Sistem';

  const featurePreviewItems = [
    {
      title: 'Manajemen Stok Obat',
      description: 'Pencatatan stok masuk dan keluar secara otomatis, dilengkapi peringatan stok minimum dan kedaluwarsa.',
      icon: <Inventory2Rounded fontSize="large" sx={{ color: '#10b981' }} />,
    },
    {
      title: 'Pencatatan Transaksi',
      description: 'Pencatatan penjualan harian yang terintegrasi dengan data stok untuk mengurangi kesalahan pencatatan manual.',
      icon: <InsertChartRounded fontSize="large" sx={{ color: '#0ea5e9' }} />,
    },
    {
      title: 'Pengelolaan Supplier',
      description: 'Data supplier dan riwayat pengadaan obat tersimpan rapi untuk mempermudah proses pemesanan ulang.',
      icon: <LocalShippingRounded fontSize="large" sx={{ color: '#8b5cf6' }} />,
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Admin',
      description: 'Mengelola data master obat, supplier, pengguna, serta memantau seluruh operasional.',
      icon: <AdminPanelSettingsRounded sx={{ color: '#10b981', fontSize: 30 }} />,
    },
    {
      step: '02',
      title: 'Kasir',
      description: 'Memproses transaksi penjualan langsung dan mencatat setiap detail pembayaran.',
      icon: <PointOfSaleRounded sx={{ color: '#0ea5e9', fontSize: 30 }} />,
    },
    {
      step: '03',
      title: 'Pelanggan',
      description: 'Melihat katalog obat dan melakukan pemesanan melalui portal secara mandiri.',
      icon: <ShoppingCartRounded sx={{ color: '#8b5cf6', fontSize: 30 }} />,
    },
    {
      step: '04',
      title: 'Laporan',
      description: 'Laporan penjualan, stok, dan pengadaan dihasilkan otomatis untuk evaluasi manajemen.',
      icon: <AssessmentRounded sx={{ color: '#f59e0b', fontSize: 30 }} />,
    },
  ];

  return (
    <Box className="landing-root">
      <Box className="landing-aurora landing-aurora-left" />
      <Box className="landing-aurora landing-aurora-right" />

      <Container maxWidth="lg" className="landing-container">
        {/* Navigasi */}
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
        </Box>

        {/* Hero Section */}
        <Box className="landing-hero-grid">
          <Box className="landing-copy">
            <Chip label="Apotek Pemuda Farma — Bojonegoro" className="landing-chip" size="small" />
            <Typography variant="h2" className="landing-title">
              Sistem Informasi{' '}
              <span className="text-gradient">Manajemen Apotek</span>{' '}
              Berbasis Web
            </Typography>
            <Typography variant="body1" className="landing-subtitle">
              Sistem ini dirancang untuk mengelola data obat, transaksi penjualan, pengadaan, hingga pelaporan secara terintegrasi guna meminimalisir kesalahan operasional di Apotek Pemuda Farma.
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
              <Button component={Link} to="/customer-login" variant="outlined" className="landing-cta-secondary">
                Portal Pelanggan
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

        {/* Modul Utama Sistem */}
        <Box className="landing-section-block">
          <Box className="landing-section-head">
            <Typography variant="h4" className="landing-section-title">
              Modul Utama Sistem
            </Typography>
            <Typography variant="body1" className="landing-section-subtitle">
              Modul-modul yang dirancang untuk mendigitalisasi proses operasional harian apotek.
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

        {/* Alur Kerja Sistem */}
        <Box className="landing-section-block landing-workflow-block">
          <Box className="landing-section-head">
            <Typography variant="h4" className="landing-section-title">
              Alur Kerja Sistem
            </Typography>
            <Typography variant="body1" className="landing-section-subtitle">
              Sistem ini melibatkan beberapa peran pengguna yang saling terintegrasi dalam satu platform.
            </Typography>
          </Box>

          <Box className="landing-workflow-grid">
            {workflowSteps.map((item, index) => (
              <Box key={item.step} className="landing-workflow-step">
                <Box className="landing-workflow-number">{item.step}</Box>
                <Box className="landing-workflow-icon">{item.icon}</Box>
                <Typography variant="h6" className="landing-workflow-title">
                  {item.title}
                </Typography>
                <Typography variant="body2" className="landing-workflow-desc">
                  {item.description}
                </Typography>
                {index < workflowSteps.length - 1 && (
                  <Box className="landing-workflow-connector" aria-hidden="true" />
                )}
              </Box>
            ))}
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
                Jl. Pemuda Timur No.120, Bojonegoro
              </Typography>
              <Typography variant="body2" className="landing-footer-text">
                Senin - Sabtu, 08.00 - 21.00
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