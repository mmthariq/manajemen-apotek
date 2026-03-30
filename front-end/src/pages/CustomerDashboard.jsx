import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Sidebar from '../components/Sidebar';
import '../styles/CustomerDashboard.css';

const API_BASE_URL = 'http://localhost:3000/api/orders';
const CUSTOMER_API_BASE_URL = 'http://localhost:3000/api/customers';

const STATUS_LABELS = {
  pending_payment: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  processed: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const CustomerDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customerData, setCustomerData] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [selectedPayOrderId, setSelectedPayOrderId] = useState(null);
  const [cart, setCart] = useState([]);
  const fileInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const [medicines] = useState([
    { id: 1, nama: 'Paracetamol 500mg', harga: 10000, kategori: 'Standar', stok: 50 },
    { id: 2, nama: 'Amoxicillin 250mg', harga: 25000, kategori: 'Antibiotik', stok: 30 },
    { id: 3, nama: 'Omeprazole 20mg', harga: 15000, kategori: 'Standar', stok: 40 },
  ]);

  const [customMedicines] = useState([
    { id: 101, nama: 'Racikan Penurun Panas', harga: 45000, deskripsi: 'Campuran untuk menekan demam', stok: 20 },
    { id: 102, nama: 'Racikan Batuk Kering', harga: 35000, deskripsi: 'Campuran untuk batuk kering', stok: 15 },
  ]);

  const loadLocalOrderHistory = () => {
    const storedOrders = localStorage.getItem('orderHistory');
    if (!storedOrders) return [];

    try {
      const parsed = JSON.parse(storedOrders);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const persistCustomerData = (nextCustomerData) => {
    setCustomerData(nextCustomerData);
    localStorage.setItem('customerData', JSON.stringify(nextCustomerData));
    window.dispatchEvent(new Event('customerDataUpdated'));
  };

  const hydrateProfileForm = (data) => {
    setProfileForm({
      name: data?.name || data?.username || '',
      email: data?.email || '',
      phone: data?.phone || '',
      address: data?.address || '',
    });
  };

  const fetchCustomerProfile = async (customerId) => {
    if (!customerId) return;

    try {
      const response = await fetch(`${CUSTOMER_API_BASE_URL}/${customerId}/profile`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat profil pelanggan.');
      }

      const profile = result.data || {};
      const nextCustomer = {
        ...customerData,
        ...profile,
        name: profile.name || profile.username || customerData?.name,
        role: 'customer',
      };

      persistCustomerData(nextCustomer);
      hydrateProfileForm(nextCustomer);
    } catch (error) {
      setProfileMessage({
        type: 'warning',
        text: error.message || 'Profil terbaru tidak dapat dimuat. Menampilkan data lokal.',
      });
    }
  };

  const handleProfileInputChange = (field) => (event) => {
    const value = event.target.value;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    if (profileMessage.text) {
      setProfileMessage({ type: '', text: '' });
    }
  };

  const handleSaveProfile = async () => {
    const normalizedName = profileForm.name.trim();
    if (!normalizedName) {
      setProfileMessage({ type: 'error', text: 'Nama wajib diisi.' });
      return;
    }

    const currentCustomerId = customerData?.id;
    setIsProfileSaving(true);

    try {
      const payload = {
        name: normalizedName,
        phone: profileForm.phone.trim() || null,
        address: profileForm.address.trim() || null,
      };

      let nextCustomer = {
        ...customerData,
        ...payload,
        email: profileForm.email,
        role: 'customer',
      };

      if (currentCustomerId) {
        const response = await fetch(`${CUSTOMER_API_BASE_URL}/${currentCustomerId}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Gagal memperbarui profil.');
        }

        const updated = result.data || {};
        nextCustomer = {
          ...nextCustomer,
          ...updated,
          name: updated.name || updated.username || nextCustomer.name,
          role: 'customer',
        };
      }

      persistCustomerData(nextCustomer);
      hydrateProfileForm(nextCustomer);
      setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Terjadi kesalahan saat menyimpan profil.' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  useEffect(() => {
    const storedCustomer = localStorage.getItem('customerData');

    if (storedCustomer) {
      try {
        const parsed = JSON.parse(storedCustomer);
        setCustomerData(parsed);
        hydrateProfileForm(parsed);
      } catch (error) {
        setCustomerData(null);
      }
    } else {
      hydrateProfileForm(null);
    }

    setOrderHistory(loadLocalOrderHistory());
  }, []);

  useEffect(() => {
    hydrateProfileForm(customerData);
  }, [customerData]);

  useEffect(() => {
    const tab = searchParams.get('tab');

    if (tab === 'profile' || tab === 'history') {
      setActiveTab(tab);
      return;
    }

    const productTab = searchParams.get('productTab');
    if (productTab === 'custom') {
      setActiveTab('custom');
    } else {
      setActiveTab('catalog');
    }
  }, [searchParams]);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + (item.harga * item.quantity), 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const normalizeStatus = (status) => {
    const value = String(status || '').toLowerCase();

    if (value.includes('menunggu') && value.includes('pembayaran')) return 'pending_payment';
    if (value.includes('dibayar')) return 'paid';
    if (value.includes('diproses')) return 'processed';
    if (value.includes('selesai')) return 'completed';
    if (value.includes('batal')) return 'cancelled';

    return status || 'pending_payment';
  };

  const resolveOrderStatus = (order) => (
    normalizeStatus(order?.order_status || order?.status)
  );

  const resolveOrderLabel = (order) => {
    const status = resolveOrderStatus(order);
    return STATUS_LABELS[status] || status;
  };

  const resolveNumericOrderId = (order) => {
    const raw = String(order?.id ?? '');
    const cleaned = raw.replace(/^ORD-/, '');
    return /^\d+$/.test(cleaned) ? cleaned : null;
  };

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);

  const addToCart = (item, type = 'regular') => {
    setCart((prev) => {
      const found = prev.find((cartItem) => cartItem.id === item.id && cartItem.type === type);
      if (found) {
        return prev.map((cartItem) => (
          cartItem.id === item.id && cartItem.type === type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }

      return [...prev, { ...item, type, quantity: 1 }];
    });
  };

  const updateQuantity = (id, type, nextQty) => {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => !(item.id === id && item.type === type)));
      return;
    }

    setCart((prev) => prev.map((item) => (
      item.id === id && item.type === type
        ? { ...item, quantity: nextQty }
        : item
    )));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsOrderLoading(true);
      setOrderError('');

      const payload = {
        customer_id: customerData?.id ?? null,
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.nama,
          product_type: item.type,
          quantity: item.quantity,
          price_per_unit: item.harga,
        })),
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat pesanan.');
      }

      const createdOrder = result.data || {};
      const orderData = {
        id: createdOrder.id,
        order_status: createdOrder.order_status || 'pending_payment',
        order_time: createdOrder.order_time || new Date().toISOString(),
        total_amount: createdOrder.total_amount ?? cartTotal,
        items: cart.map((item) => ({
          product_name: item.nama,
          quantity: item.quantity,
          price_per_unit: item.harga,
          subtotal: item.harga * item.quantity,
        })),
      };

      const nextOrderHistory = [
        {
          id: orderData.id,
          order_status: orderData.order_status,
          order_time: orderData.order_time,
          total_amount: orderData.total_amount,
          total_items: cart.reduce((total, item) => total + item.quantity, 0),
        },
        ...orderHistory,
      ];

      setOrderHistory(nextOrderHistory);
      setCart([]);
      setIsCartOpen(false);

      navigate('/order-success', { state: { orderData } });
    } catch (error) {
      setOrderError(error.message || 'Terjadi kesalahan saat checkout.');
    } finally {
      setIsOrderLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      setIsOrderLoading(true);
      setOrderError('');

      const customerId = customerData?.id;
      const url = customerId
        ? `${API_BASE_URL}?customerId=${customerId}`
        : API_BASE_URL;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengambil riwayat pesanan.');
      }

      const mapped = Array.isArray(result.data)
        ? result.data
        : [];

      if (mapped.length > 0) {
        setOrderHistory(mapped);
      }
    } catch (error) {
      const fallbackOrders = loadLocalOrderHistory();
      if (fallbackOrders.length === 0) {
        setOrderError(error.message || 'Terjadi kesalahan saat memuat riwayat pesanan.');
      }
    } finally {
      setIsOrderLoading(false);
    }
  };

  const handlePayNow = (order) => {
    const resolvedId = resolveNumericOrderId(order);
    if (!resolvedId) {
      setOrderError('ID pesanan tidak valid untuk pembayaran.');
      return;
    }

    setSelectedPayOrderId(resolvedId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePaymentFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPayOrderId) return;

    try {
      setPayingOrderId(selectedPayOrderId);
      setOrderError('');

      const formData = new FormData();
      formData.append('paymentProof', file);

      const response = await fetch(`${API_BASE_URL}/${selectedPayOrderId}/pay`, {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengunggah bukti pembayaran.');
      }

      await fetchOrderHistory();
    } catch (error) {
      setOrderError(error.message || 'Terjadi kesalahan saat mengunggah bukti pembayaran.');
    } finally {
      setPayingOrderId(null);
      setSelectedPayOrderId(null);
      event.target.value = '';
    }
  };

  const handleCancelOrder = async (order) => {
    const resolvedId = resolveNumericOrderId(order);
    if (!resolvedId) {
      setOrderError('ID pesanan tidak valid untuk pembatalan.');
      return;
    }

    try {
      setCancellingOrderId(resolvedId);
      setOrderError('');

      const response = await fetch(`${API_BASE_URL}/${resolvedId}/cancel`, {
        method: 'PATCH',
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal membatalkan pesanan.');
      }

      await fetchOrderHistory();
    } catch (error) {
      setOrderError(error.message || 'Terjadi kesalahan saat membatalkan pesanan.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const showProfile = activeTab === 'profile';
  const showHistory = activeTab === 'history';
  const showCatalog = activeTab === 'catalog';
  const showCustom = activeTab === 'custom';

  useEffect(() => {
    if (showHistory) {
      fetchOrderHistory();
    }
  }, [showHistory, customerData?.id]);

  useEffect(() => {
    if (showProfile && customerData?.id) {
      fetchCustomerProfile(customerData.id);
    }
  }, [showProfile, customerData?.id]);

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} userRole="customer" />

      <div className="main-content">
        <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} align="center">
            Dashboard Belanja Online
          </Typography>
        </Card>

        <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant={showCatalog ? 'contained' : 'outlined'}
                onClick={() => setSearchParams({ tab: 'catalog', productTab: 'catalog' })}
              >
                Katalog Obat
              </Button>
              <Button
                variant={showCustom ? 'contained' : 'outlined'}
                onClick={() => setSearchParams({ tab: 'catalog', productTab: 'custom' })}
              >
                Obat Racikan
              </Button>
            </Stack>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<ShoppingCartIcon />}
              onClick={() => setIsCartOpen(true)}
              type="button"
            >
              <Badge badgeContent={cartItemCount} color="warning" sx={{ mr: 1 }} />
              Keranjang
            </Button>
          </Stack>
        </Card>

        {showProfile && (
          <Card className="profile-modern-card" sx={{ p: 0, borderRadius: 4, overflow: 'hidden' }}>
            <Box className="profile-modern-hero">
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Avatar
                  sx={{ width: 72, height: 72, fontWeight: 700, bgcolor: '#125B50', boxShadow: '0 10px 24px rgba(18, 91, 80, 0.35)' }}
                >
                  {String(profileForm.name || customerData?.name || 'C').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">
                    Profil Saya
                  </Typography>
                  <Typography color="#334155" mt={0.5}>
                    Kelola detail akun untuk pengalaman belanja yang lebih personal.
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
                <Chip label={`ID: ${customerData?.id || '-'}`} color="info" variant="outlined" />
                <Chip label={customerData?.membershipStatus || 'active'} color="success" variant="outlined" />
                <Chip label={customerData?.isMember === false ? 'Non Member' : 'Member Aktif'} color="secondary" variant="outlined" />
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {profileMessage.text && (
                <Alert severity={profileMessage.type || 'info'} sx={{ mb: 2 }}>
                  {profileMessage.text}
                </Alert>
              )}

              <Grid container spacing={2.2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    value={profileForm.name}
                    onChange={handleProfileInputChange('name')}
                    disabled={isProfileSaving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileForm.email}
                    InputProps={{ readOnly: true }}
                    helperText="Email saat ini hanya dapat diubah oleh admin."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="No. Telepon"
                    value={profileForm.phone}
                    placeholder="Contoh: 081234567890"
                    onChange={handleProfileInputChange('phone')}
                    disabled={isProfileSaving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Alamat"
                    value={profileForm.address}
                    placeholder="Jalan, kecamatan, kota"
                    onChange={handleProfileInputChange('address')}
                    disabled={isProfileSaving}
                  />
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" mt={3}>
                <Typography color="text.secondary" fontSize={14}>
                  Perubahan disimpan ke profil akun customer Anda.
                </Typography>
                <Stack direction="row" spacing={1.2}>
                  <Button
                    variant="outlined"
                    type="button"
                    disabled={isProfileSaving}
                    onClick={() => hydrateProfileForm(customerData)}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    type="button"
                    disabled={isProfileSaving}
                    onClick={handleSaveProfile}
                  >
                    {isProfileSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Card>
        )}

        {showHistory && (
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={2}>Riwayat Pesanan</Typography>
            {orderError && (
              <Typography color="error" mb={2}>{orderError}</Typography>
            )}
            {isOrderLoading && (
              <Typography color="text.secondary" mb={2}>Memuat pesanan...</Typography>
            )}
            {orderHistory.length === 0 ? (
              <Typography color="text.secondary">Belum ada pesanan.</Typography>
            ) : (
              <List>
                {orderHistory.map((order, index) => (
                  <React.Fragment key={order.id || index}>
                    <ListItem sx={{ px: 0, alignItems: 'flex-start', gap: 2 }}>
                      <ListItemText
                        primary={`${order.id} - ${formatCurrency(order.total_amount)}`}
                        secondary={`${order.order_time ? new Date(order.order_time).toLocaleString('id-ID') : '-'} | ${resolveOrderLabel(order)}`}
                      />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const resolvedId = resolveNumericOrderId(order);
                            if (!resolvedId) {
                              setOrderError('ID pesanan tidak valid untuk detail.');
                              return;
                            }
                            navigate(`/orders/${resolvedId}`);
                          }}
                        >
                          Detail
                        </Button>
                        {resolveOrderStatus(order) === 'pending_payment' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handlePayNow(order)}
                              disabled={payingOrderId === resolveNumericOrderId(order)}
                            >
                              Bayar Sekarang
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              color="error"
                              onClick={() => handleCancelOrder(order)}
                              disabled={cancellingOrderId === resolveNumericOrderId(order)}
                            >
                              Batalkan
                            </Button>
                          </>
                        )}
                        {resolveOrderStatus(order) === 'paid' && (
                          <Typography color="text.secondary" fontSize={13} sx={{ alignSelf: 'center' }}>
                            Menunggu diproses
                          </Typography>
                        )}
                      </Stack>
                    </ListItem>
                    {index < orderHistory.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePaymentFileChange}
              style={{ display: 'none' }}
            />
          </Card>
        )}

        {(showCatalog || showCustom) && (
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={2}>
              {showCatalog ? 'Obat Standar' : 'Obat Racikan'}
            </Typography>
            <Grid container spacing={2}>
              {(showCatalog ? medicines : customMedicines).map((medicine) => (
                <Grid item xs={12} md={6} lg={4} key={medicine.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" fontSize={20}>{medicine.nama}</Typography>
                        <Chip
                          size="small"
                          label={showCatalog ? medicine.kategori : 'Racikan'}
                          color={showCatalog ? 'info' : 'secondary'}
                          variant="outlined"
                        />
                      </Stack>
                      {!showCatalog && medicine.deskripsi && (
                        <Typography color="text.secondary" fontSize={13} mb={1}>
                          {medicine.deskripsi}
                        </Typography>
                      )}
                      <Typography color="success.main" fontWeight={700} fontSize={20}>
                        {formatCurrency(medicine.harga)}
                      </Typography>
                      <Typography color="text.secondary" fontSize={13} mt={0.5}>
                        Stok: {medicine.stok}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => addToCart(medicine, showCatalog ? 'regular' : 'custom')}
                      >
                        + Tambah ke Keranjang
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        )}
      </div>

      <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <Box sx={{ width: { xs: 320, sm: 420 }, p: 2.5 }} role="presentation">
          <Typography variant="h6" fontWeight={700}>Keranjang Belanja</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Ringkasan item, qty, dan subtotal</Typography>
          {orderError && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {orderError}
            </Alert>
          )}
          <Divider sx={{ mb: 2 }} />

          {cartItemCount === 0 ? (
            <Typography color="text.secondary">Keranjang masih kosong.</Typography>
          ) : (
            <List sx={{ mb: 2, maxHeight: 'calc(100vh - 290px)', overflowY: 'auto', pr: 0.5 }}>
              {cart.map((item) => (
                <ListItem key={`${item.id}-${item.type}`} sx={{ px: 0 }}>
                  <Box sx={{ width: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={600}>{item.nama}</Typography>
                      <IconButton color="error" onClick={() => updateQuantity(item.id, item.type, 0)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{formatCurrency(item.harga)} / item</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography fontWeight={700}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <Box sx={{ flex: 1 }} />
                      <Typography fontWeight={700}>{formatCurrency(item.harga * item.quantity)}</Typography>
                    </Stack>
                    <Divider sx={{ mt: 1.5 }} />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Stack spacing={1.2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Subtotal</Typography>
              <Typography fontWeight={700}>{formatCurrency(cartTotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Ongkir</Typography>
              <Typography>Rp 10.000</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={700}>{formatCurrency(cartTotal + 10000)}</Typography>
            </Stack>
            <Button
              variant="contained"
              size="large"
              type="button"
              disabled={cartItemCount === 0 || isOrderLoading}
              onClick={handleCheckout}
              sx={{ position: 'relative', zIndex: 2 }}
            >
              Checkout
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </div>
  );
};

export default CustomerDashboard;
