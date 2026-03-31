import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, Chip, Divider, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.orderData || null;

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value || 0);

  const statusLabels = {
    pending_payment: 'Menunggu Pembayaran',
    payment_uploaded: 'Menunggu Verifikasi Pembayaran',
    paid: 'Sudah Dibayar',
    processed: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  const normalizeStatus = (status) => {
    const value = String(status || '').toLowerCase();

    if (value.includes('menunggu') && value.includes('pembayaran')) return 'pending_payment';
    if (value.includes('verifikasi')) return 'payment_uploaded';
    if (value.includes('uploaded')) return 'payment_uploaded';
    if (value.includes('dibayar')) return 'paid';
    if (value.includes('diproses')) return 'processed';
    if (value.includes('selesai')) return 'completed';
    if (value.includes('batal')) return 'cancelled';

    return status || 'pending_payment';
  };

  const resolvedStatus = normalizeStatus(order?.order_status || order?.status);
  const statusLabel = statusLabels[resolvedStatus] || resolvedStatus || 'Menunggu Pembayaran';

  const resolveItemName = (item) => item.product_name || item.nama || 'Item';
  const resolveItemPrice = (item) => Number(item.price_per_unit ?? item.harga ?? 0);

  if (!order) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, backgroundColor: '#f5f7fa' }}>
        <Card sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 560, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} mb={1}>Data pesanan tidak ditemukan</Typography>
          <Typography color="text.secondary" mb={3}>Silakan lakukan checkout terlebih dahulu.</Typography>
          <Button variant="contained" onClick={() => navigate('/customer-dashboard?tab=catalog')}>Kembali Belanja</Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, backgroundColor: '#f5f7fa' }}>
      <Card sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 720 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h4" fontWeight={800}>Pesanan Berhasil</Typography>
          <Chip label={statusLabel} color="warning" variant="outlined" />
        </Stack>

        <Typography color="text.secondary" mb={2}>
          ID Pesanan: {order.id} | {new Date(order.order_time || Date.now()).toLocaleString('id-ID')}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" fontWeight={700} mb={1}>Ringkasan Pesanan</Typography>
        <List>
          {(order.items || []).map((item, index) => {
            const itemPrice = resolveItemPrice(item);
            return (
              <ListItem key={`${item.id || index}`} sx={{ px: 0 }}>
                <ListItemText
                  primary={`${resolveItemName(item)} x${item.quantity}`}
                  secondary={`${formatCurrency(itemPrice)} / item`}
                />
                <Typography fontWeight={700}>{formatCurrency(itemPrice * item.quantity)}</Typography>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography>Subtotal</Typography>
          <Typography fontWeight={700}>{formatCurrency(order.total_amount || 0)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography>Ongkir</Typography>
          <Typography>Rp 10.000</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography fontWeight={800}>Total Bayar</Typography>
          <Typography fontWeight={800}>{formatCurrency((order.total_amount || 0) + 10000)}</Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" onClick={() => navigate('/customer-dashboard?tab=history')}>Lihat Riwayat Pesanan</Button>
          <Button variant="outlined" onClick={() => navigate('/customer-dashboard?tab=catalog')}>Belanja Lagi</Button>
        </Stack>
      </Card>
    </Box>
  );
};

export default OrderSuccess;
