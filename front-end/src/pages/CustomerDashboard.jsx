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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/CustomerDashboard.css';

const API_BASE_URL = 'http://localhost:3000/api/orders';
const CUSTOMER_API_BASE_URL = 'http://localhost:3000/api/customers';
const BACKEND_BASE_URL = 'http://localhost:3000';
const DRUG_API_BASE_URL = 'http://localhost:3000/api/obat';
const CUSTOM_MED_API_BASE_URL = 'http://localhost:3000/api/custom-medicine';

const STATUS_LABELS = {
  pending_payment: 'Menunggu Pembayaran',
  payment_uploaded: 'Menunggu Verifikasi Pembayaran',
  paid: 'Sudah Dibayar',
  processed: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const CustomerDashboard = ({ onLogout, authToken, currentUser, onUserUpdate }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customerData, setCustomerData] = useState(currentUser || null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [selectedPayOrderId, setSelectedPayOrderId] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('default');
  const fileInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [catalogMessage, setCatalogMessage] = useState('');

  const [medicines, setMedicines] = useState([]);
  const [customMedicines, setCustomMedicines] = useState([]);

  const getAuthHeaders = (includeJsonContentType = false) => {
    const headers = {};
    if (includeJsonContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return headers;
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
      const response = await fetch(`${CUSTOMER_API_BASE_URL}/${customerId}/profile`, {
        headers: getAuthHeaders(),
      });
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

      setCustomerData(nextCustomer);
      if (typeof onUserUpdate === 'function') {
        onUserUpdate(nextCustomer);
      }
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
          headers: getAuthHeaders(true),
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

      setCustomerData(nextCustomer);
      if (typeof onUserUpdate === 'function') {
        onUserUpdate(nextCustomer);
      }
      hydrateProfileForm(nextCustomer);
      setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Terjadi kesalahan saat menyimpan profil.' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  useEffect(() => {
    setCustomerData(currentUser || null);
    hydrateProfileForm(currentUser || null);
  }, [currentUser]);

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

  const detailOrderId = searchParams.get('detail');

  const openOrderDetail = (resolvedId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'history');
    nextParams.set('detail', resolvedId);
    setSearchParams(nextParams);
  };

  const closeOrderDetail = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('detail');
    setSearchParams(nextParams);
    setSelectedOrder(null);
    setSelectedOrderItems([]);
    setDetailError('');
  };

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setCatalogMessage('');
        const [drugsResponse, customResponse] = await Promise.all([
          fetch(DRUG_API_BASE_URL),
          fetch(CUSTOM_MED_API_BASE_URL),
        ]);

        const drugsResult = await drugsResponse.json();
        const customResult = await customResponse.json();

        if (!drugsResponse.ok) {
          throw new Error(drugsResult.message || 'Gagal memuat katalog obat.');
        }

        if (!customResponse.ok) {
          throw new Error(customResult.message || 'Gagal memuat katalog obat racikan.');
        }

        setMedicines(
          Array.isArray(drugsResult.data)
            ? drugsResult.data.map((item) => ({
              id: item.id,
              nama: item.name,
              harga: Number(item.price || 0),
              kategori: item.unit || 'Lainnya',
              stok: Number(item.stock || 0),
              popularitas: Number(item.stock || 0),
            }))
            : []
        );

        setCustomMedicines(
          Array.isArray(customResult.data)
            ? customResult.data.map((item) => ({
              id: item.id,
              nama: item.nama,
              harga: Number(item.harga || 0),
              deskripsi: item.deskripsi || '',
              stok: Number(item.stok || 0),
              popularitas: Number(item.stok || 0),
            }))
            : []
        );
      } catch (error) {
        setCatalogMessage(error.message || 'Terjadi kesalahan saat memuat katalog.');
      }
    };

    fetchCatalogData();
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + (item.harga * item.quantity), 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const categoryOptions = useMemo(() => {
    const categories = medicines.map((item) => item.kategori).filter(Boolean);
    return ['all', ...Array.from(new Set(categories))];
  }, [medicines]);

  const applyProductFilters = (items, includeCategory = false) => {
    let filtered = [...items];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (normalizedSearch) {
      filtered = filtered.filter((item) => String(item.nama || '').toLowerCase().includes(normalizedSearch));
    }

    if (includeCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.kategori === selectedCategory);
    }

    if (maxPriceFilter !== 'all') {
      const maxPrice = Number(maxPriceFilter);
      filtered = filtered.filter((item) => Number(item.harga) <= maxPrice);
    }

    if (sortFilter === 'price_low') {
      filtered.sort((a, b) => Number(a.harga) - Number(b.harga));
    } else if (sortFilter === 'price_high') {
      filtered.sort((a, b) => Number(b.harga) - Number(a.harga));
    } else if (sortFilter === 'popular') {
      filtered.sort((a, b) => Number(b.popularitas || 0) - Number(a.popularitas || 0));
    }

    return filtered;
  };

  const filteredMedicines = useMemo(
    () => applyProductFilters(medicines, true),
    [medicines, searchQuery, selectedCategory, maxPriceFilter, sortFilter]
  );

  const filteredCustomMedicines = useMemo(
    () => applyProductFilters(customMedicines, false),
    [customMedicines, searchQuery, maxPriceFilter, sortFilter]
  );

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

  const resolveProofImageUrl = (proofPath) => {
    if (!proofPath) {
      return null;
    }

    if (String(proofPath).startsWith('http')) {
      return proofPath;
    }

    return `${BACKEND_BASE_URL}${proofPath}`;
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
        headers: getAuthHeaders(true),
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

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengambil riwayat pesanan.');
      }

      const mapped = Array.isArray(result.data)
        ? result.data
        : [];

      setOrderHistory(mapped);
    } catch (error) {
      setOrderError(error.message || 'Terjadi kesalahan saat memuat riwayat pesanan.');
    } finally {
      setIsOrderLoading(false);
    }
  };

  const fetchOrderDetail = async (resolvedId) => {
    try {
      setIsDetailLoading(true);
      setDetailError('');

      const response = await fetch(`${API_BASE_URL}/${resolvedId}`, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengambil detail pesanan.');
      }

      const payload = result.data || {};
      setSelectedOrder(payload.id ? payload : null);
      setSelectedOrderItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (error) {
      setDetailError(error.message || 'Terjadi kesalahan saat memuat detail pesanan.');
      setSelectedOrder(null);
      setSelectedOrderItems([]);
    } finally {
      setIsDetailLoading(false);
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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

  const handleDeleteCancelledOrder = async (order) => {
    const resolvedId = resolveNumericOrderId(order);
    if (!resolvedId) {
      setOrderError('ID pesanan tidak valid untuk dihapus.');
      return;
    }

    const confirmed = window.confirm('Hapus pesanan yang sudah dibatalkan ini dari riwayat?');
    if (!confirmed) return;

    try {
      setDeletingOrderId(resolvedId);
      setOrderError('');

      const response = await fetch(`${API_BASE_URL}/${resolvedId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus pesanan dibatalkan.');
      }

      await fetchOrderHistory();
    } catch (error) {
      setOrderError(error.message || 'Terjadi kesalahan saat menghapus pesanan.');
    } finally {
      setDeletingOrderId(null);
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
    if (!detailOrderId) {
      return;
    }

    fetchOrderDetail(detailOrderId);
  }, [detailOrderId, authToken]);

  useEffect(() => {
    if (showProfile && customerData?.id) {
      fetchCustomerProfile(customerData.id);
    }
  }, [showProfile, customerData?.id]);

  return (
    <DashboardLayout onLogout={onLogout} userRole="customer" currentUser={customerData}>
      <div className="main-content">
        <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} align="center">
            Dashboard Belanja Online
          </Typography>
        </Card>

        <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          {catalogMessage && (
            <Typography color="error" mb={1}>{catalogMessage}</Typography>
          )}
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
                        {order.payment_proof_image_url && (
                          <Button
                            size="small"
                            variant="text"
                            component="a"
                            href={resolveProofImageUrl(order.payment_proof_image_url)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Lihat Bukti
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const resolvedId = resolveNumericOrderId(order);
                            if (!resolvedId) {
                              setOrderError('ID pesanan tidak valid untuk detail.');
                              return;
                            }
                            openOrderDetail(resolvedId);
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
                            Pembayaran terverifikasi, menunggu diproses
                          </Typography>
                        )}
                        {resolveOrderStatus(order) === 'payment_uploaded' && (
                          <Typography color="text.secondary" fontSize={13} sx={{ alignSelf: 'center' }}>
                            Menunggu verifikasi pembayaran oleh admin
                          </Typography>
                        )}
                        {resolveOrderStatus(order) === 'cancelled' && (
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            onClick={() => handleDeleteCancelledOrder(order)}
                            disabled={deletingOrderId === resolveNumericOrderId(order)}
                          >
                            Hapus
                          </Button>
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
            <Grid container spacing={1.5} mb={2.5}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cari produk"
                  placeholder="Contoh: Paracetamol"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </Grid>
              {showCatalog && (
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Kategori"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option === 'all' ? 'Semua Kategori' : option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12} md={showCatalog ? 2.5 : 4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Rentang Harga"
                  value={maxPriceFilter}
                  onChange={(event) => setMaxPriceFilter(event.target.value)}
                >
                  <MenuItem value="all">Semua Harga</MenuItem>
                  <MenuItem value="15000">Sampai Rp 15.000</MenuItem>
                  <MenuItem value="30000">Sampai Rp 30.000</MenuItem>
                  <MenuItem value="50000">Sampai Rp 50.000</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={showCatalog ? 2.5 : 4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Urutkan"
                  value={sortFilter}
                  onChange={(event) => setSortFilter(event.target.value)}
                >
                  <MenuItem value="default">Paling Relevan</MenuItem>
                  <MenuItem value="popular">Popularitas</MenuItem>
                  <MenuItem value="price_low">Harga Termurah</MenuItem>
                  <MenuItem value="price_high">Harga Termahal</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              {(showCatalog ? filteredMedicines : filteredCustomMedicines).map((medicine) => (
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

        {detailOrderId && (
          <div className="customer-order-overlay" onClick={closeOrderDetail}>
            <Card
              className="customer-order-dialog"
              sx={{ p: { xs: 3, sm: 4 } }}
              onClick={(event) => event.stopPropagation()}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} mb={1}>
                <Typography variant="h5" fontWeight={800}>Detail Pesanan</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {selectedOrder && (
                    <Chip label={resolveOrderLabel(selectedOrder)} color="info" variant="outlined" />
                  )}
                  <Button size="small" variant="outlined" onClick={closeOrderDetail}>
                    Tutup
                  </Button>
                </Stack>
              </Stack>

              {isDetailLoading && (
                <Typography color="text.secondary">Memuat detail pesanan...</Typography>
              )}

              {!isDetailLoading && detailError && (
                <Typography color="error">{detailError}</Typography>
              )}

              {!isDetailLoading && !detailError && selectedOrder && (
                <>
                  <Typography color="text.secondary" mb={2}>
                    ID Pesanan: {selectedOrder.id} | {selectedOrder.order_time ? new Date(selectedOrder.order_time).toLocaleString('id-ID') : '-'}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="h6" fontWeight={700} mb={1}>Daftar Item</Typography>
                  {selectedOrderItems.length === 0 ? (
                    <Typography color="text.secondary">Item pesanan tidak ditemukan.</Typography>
                  ) : (
                    <List>
                      {selectedOrderItems.map((item, index) => (
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
                    <Typography fontWeight={800}>{formatCurrency(selectedOrder.total_amount)}</Typography>
                  </Stack>
                </>
              )}
            </Card>
          </div>
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
    </DashboardLayout>
  );
};

export default CustomerDashboard;
