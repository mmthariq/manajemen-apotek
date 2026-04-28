import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, Divider, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.orderData || null;

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value || 0);

  const statusLabels = {
    PENDING: 'Menunggu Pembayaran',
    VERIFIED: 'Diproses',
    COMPLETED: 'Siap Diambil/Dikirim',
    CANCELLED: 'Dibatalkan',
  };

  const normalizeStatus = (status) => {
    const value = String(status || '').trim().toUpperCase();

    if (value === 'PENDING' || value === 'PENDING_PAYMENT') return 'PENDING';
    if (value === 'PAYMENT_UPLOADED' || value === 'PAID' || value === 'PROCESSED' || value === 'VERIFIED') return 'VERIFIED';
    if (value === 'COMPLETED' || value === 'SELESAI') return 'COMPLETED';
    if (value === 'CANCELLED' || value === 'DIBATALKAN') return 'CANCELLED';

    return 'PENDING';
  };

  const resolvedStatus = normalizeStatus(order?.orderStatus || order?.status || order?.order_status);
  const statusLabel = statusLabels[resolvedStatus] || 'Menunggu Pembayaran';

  const resolveItemName = (item) => item.drugName || item.product_name || item.nama || 'Item';
  const resolveItemPrice = (item) => Number(item.unitPrice ?? item.price_per_unit ?? item.harga ?? 0);

  // Steps for order progress
  const steps = [
    { label: 'Pesanan Dibuat', icon: '✅', done: true },
    { label: 'Pembayaran', icon: '💳', done: resolvedStatus !== 'PENDING' },
    { label: 'Diproses', icon: '⚙️', done: resolvedStatus === 'COMPLETED' },
    { label: 'Selesai', icon: '📦', done: resolvedStatus === 'COMPLETED' },
  ];

  if (!order) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #f5f3ff 100%)',
      }}>
        <Card sx={{ p: 5, borderRadius: 5, width: '100%', maxWidth: 520, textAlign: 'center', boxShadow: '0 16px 48px rgba(15,23,42,0.08)' }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#fee2e2', display: 'grid', placeItems: 'center',
            mx: 'auto', mb: 3,
          }}>
            <span style={{ fontSize: 36 }}>🛒</span>
          </Box>
          <Typography variant="h5" fontWeight={800} mb={1} color="#0f172a">
            Data pesanan tidak ditemukan
          </Typography>
          <Typography color="#64748b" mb={3} fontSize={15}>
            Silakan lakukan checkout terlebih dahulu dari katalog.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/customer-dashboard?tab=catalog')}
            sx={{
              borderRadius: 3, px: 4, py: 1.5,
              background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
              fontWeight: 600, textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #0d6660 0%, #0c6680 100%)' },
            }}
          >
            Kembali Belanja
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      p: 2,
      fontFamily: '"Inter", sans-serif',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #f5f3ff 100%)',
    }}>
      <Card sx={{
        p: 0,
        borderRadius: 5,
        width: '100%',
        maxWidth: 720,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(15,23,42,0.1)',
      }}>
        {/* ── Success Header ── */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 45%, #1d4ed8 100%)',
          p: 4,
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1), transparent 50%)',
            pointerEvents: 'none',
          }} />

          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
            display: 'grid', placeItems: 'center',
            mx: 'auto', mb: 2,
            border: '2px solid rgba(255,255,255,0.25)',
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
          </Box>

          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px', mb: 0.5, position: 'relative' }}>
            Pesanan Berhasil! 🎉
          </Typography>
          <Typography fontSize={15} sx={{ opacity: 0.85, position: 'relative' }}>
            ID Pesanan: #{order.id} &nbsp;|&nbsp; {new Date(order.createdAt || order.order_time || Date.now()).toLocaleString('id-ID')}
          </Typography>
        </Box>

        {/* ── Progress Steps ── */}
        <Box sx={{ px: 4, pt: 3, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
            {/* connector line */}
            <Box sx={{
              position: 'absolute', top: 16, left: '8%', right: '8%',
              height: 3, background: '#e2e8f0', borderRadius: 2, zIndex: 0,
            }} />
            <Box sx={{
              position: 'absolute', top: 16, left: '8%',
              width: `${Math.max(0, (steps.filter(s => s.done).length - 1) / (steps.length - 1)) * 84}%`,
              height: 3, background: 'linear-gradient(90deg, #0f766e, #0e7490)',
              borderRadius: 2, zIndex: 1, transition: 'width 0.5s ease',
            }} />

            {steps.map((step, idx) => (
              <Stack key={idx} alignItems="center" sx={{ zIndex: 2, flex: 1 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '50%',
                  display: 'grid', placeItems: 'center',
                  fontSize: 16,
                  background: step.done ? 'linear-gradient(135deg, #0f766e, #0e7490)' : '#e2e8f0',
                  color: step.done ? '#fff' : '#94a3b8',
                  fontWeight: 700,
                  boxShadow: step.done ? '0 4px 12px rgba(15,118,110,0.3)' : 'none',
                  transition: 'all 0.3s ease',
                  mb: 0.8,
                }}>
                  {step.done ? '✓' : idx + 1}
                </Box>
                <Typography fontSize={11} fontWeight={step.done ? 600 : 500} color={step.done ? '#0f766e' : '#94a3b8'} textAlign="center">
                  {step.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* ── Status Badge ── */}
        <Box sx={{ px: 4, pt: 2, pb: 1 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            px: 2, py: 0.8, borderRadius: 3,
            background: '#fef3c7', border: '1px solid #fcd34d',
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <Typography fontSize={13} fontWeight={600} color="#92400e">
              {statusLabel}
            </Typography>
          </Box>
        </Box>

        {/* ── Order Items ── */}
        <Box sx={{ px: 4, pt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={1} color="#0f172a">
            Ringkasan Pesanan
          </Typography>
          <List disablePadding>
            {(order.items || []).map((item, index) => {
              const itemPrice = resolveItemPrice(item);
              return (
                <ListItem key={`${item.id || index}`} sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary={
                      <Typography fontWeight={600} fontSize={15} color="#1e293b">
                        {resolveItemName(item)} &times; {item.quantity}
                      </Typography>
                    }
                    secondary={
                      <Typography fontSize={13} color="#64748b">
                        {formatCurrency(itemPrice)} / item
                      </Typography>
                    }
                  />
                  <Typography fontWeight={700} color="#0f766e" fontSize={15}>
                    {formatCurrency(itemPrice * item.quantity)}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* ── Totals ── */}
        <Box sx={{ px: 4, pt: 1, pb: 3 }}>
          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" justifyContent="space-between" mb={0.8}>
            <Typography color="#64748b" fontSize={14}>Subtotal</Typography>
            <Typography fontWeight={600} fontSize={14}>{formatCurrency(order.totalPrice || order.total_amount || 0)}</Typography>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" mb={3}>
            <Typography fontWeight={800} fontSize={18} color="#0f172a">Total Bayar</Typography>
            <Typography fontWeight={800} fontSize={18} color="#0f766e">
              {formatCurrency(order.totalPrice || order.total_amount || 0)}
            </Typography>
          </Stack>

          {/* ── CTA Buttons ── */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<ReceiptLongIcon />}
              onClick={() => navigate('/customer-dashboard?tab=history')}
              sx={{
                py: 1.5, borderRadius: 3,
                background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
                fontWeight: 600, textTransform: 'none', fontSize: 15,
                boxShadow: '0 6px 20px rgba(15,118,110,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d6660 0%, #0c6680 100%)',
                  boxShadow: '0 8px 28px rgba(15,118,110,0.35)',
                },
              }}
            >
              Lihat Riwayat Pesanan
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ShoppingBagIcon />}
              onClick={() => navigate('/customer-dashboard?tab=catalog')}
              sx={{
                py: 1.5, borderRadius: 3,
                borderColor: '#0f766e', color: '#0f766e',
                fontWeight: 600, textTransform: 'none', fontSize: 15,
                '&:hover': {
                  borderColor: '#0d6660', background: 'rgba(15,118,110,0.04)',
                },
              }}
            >
              Belanja Lagi
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default OrderSuccess;
