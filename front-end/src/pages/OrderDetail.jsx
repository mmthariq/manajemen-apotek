import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/OrderDetail.css';

const API_BASE_URL = 'http://localhost:3000/api/orders';

const STATUS_LABELS = {
  pending_payment: 'Menunggu Pembayaran',
  payment_uploaded: 'Menunggu Verifikasi Pembayaran',
  paid: 'Sudah Dibayar',
  processed: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const OrderDetail = ({ authToken, onLogout, currentUser }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value || 0);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/${orderId}`, {
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {},
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengambil detail pesanan.');
      }

      const payload = result.data || {};
      setOrder(payload.id ? payload : null);
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat detail pesanan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const statusLabel = useMemo(() => {
    const status = order?.order_status || order?.status || 'pending_payment';
    return STATUS_LABELS[status] || status;
  }, [order]);

  const renderContent = () => {
    if (isLoading) {
      return <Typography>Memuat detail pesanan...</Typography>;
    }

    if (error) {
      return (
        <Card className="order-detail-card" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} mb={1}>Detail pesanan tidak tersedia</Typography>
          <Typography color="text.secondary" mb={3}>{error}</Typography>
          <Button variant="contained" onClick={() => navigate('/customer-dashboard?tab=history')}>Kembali ke Riwayat</Button>
        </Card>
      );
    }

    if (!order) {
      return (
        <Card className="order-detail-card" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} mb={1}>Pesanan tidak ditemukan</Typography>
          <Typography color="text.secondary" mb={3}>Silakan cek kembali riwayat pesanan Anda.</Typography>
          <Button variant="contained" onClick={() => navigate('/customer-dashboard?tab=history')}>Kembali ke Riwayat</Button>
        </Card>
      );
    }

    return (
      <Card className="order-detail-card" sx={{ p: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} mb={1}>
          <Typography variant="h4" fontWeight={800}>Detail Pesanan</Typography>
          <Chip label={statusLabel} color="info" variant="outlined" />
        </Stack>

        <Typography className="order-detail-meta" mb={2}>
          ID Pesanan: {order.id} | {order.order_time ? new Date(order.order_time).toLocaleString('id-ID') : '-'}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" fontWeight={700} mb={1}>Daftar Item</Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">Item pesanan tidak ditemukan.</Typography>
        ) : (
          <List>
            {items.map((item, index) => (
              <ListItem key={item.id || index} sx={{ px: 0 }}>
                <ListItemText
                  primary={item.product_name || `Item #${index + 1}`}
                  secondary={`Qty ${item.quantity} x ${formatCurrency(item.price_per_unit)}`}
                />
                <Typography fontWeight={700}>{formatCurrency(item.subtotal)}</Typography>
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography>Total Harga</Typography>
          <Typography fontWeight={800}>{formatCurrency(order.total_amount)}</Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={3}>
          <Button variant="contained" onClick={() => navigate('/customer-dashboard?tab=history')}>Kembali ke Riwayat</Button>
        </Stack>
      </Card>
    );
  };

  return (
    <DashboardLayout onLogout={onLogout} userRole="customer" currentUser={currentUser}>
      <div className="main-content order-detail-content">
        <div className="order-detail-overlay">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
