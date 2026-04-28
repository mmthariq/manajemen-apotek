import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
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
import SearchIcon from '@mui/icons-material/Search';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ScienceIcon from '@mui/icons-material/Science';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputAdornment from '@mui/material/InputAdornment';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/CustomerDashboard.css';

const API_BASE_URL = 'http://localhost:3000/api/orders';
const CUSTOMER_API_BASE_URL = 'http://localhost:3000/api/customers';
const BACKEND_BASE_URL = 'http://localhost:3000';
const DRUG_API_BASE_URL = 'http://localhost:3000/api/obat';
const CUSTOM_MED_API_BASE_URL = 'http://localhost:3000/api/custom-medicine';

const DB_STATUS_TO_LABEL = {
  PENDING: 'Menunggu Pembayaran',
  VERIFIED: 'Diproses',
  COMPLETED: 'Siap Diambil/Dikirim',
  CANCELLED: 'Dibatalkan',
};

const STATUS_COLORS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const normalizeDbOrderStatus = (status) => {
  const value = String(status || '').trim().toUpperCase();

  if (value === 'PENDING' || value === 'PENDING_PAYMENT') return 'PENDING';
  if (value === 'PAYMENT_UPLOADED' || value === 'PAID' || value === 'PROCESSED' || value === 'VERIFIED') return 'VERIFIED';
  if (value === 'COMPLETED' || value === 'SELESAI') return 'COMPLETED';
  if (value === 'CANCELLED' || value === 'DIBATALKAN') return 'CANCELLED';

  return 'PENDING';
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
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('default');
  const fileInputRef = useRef(null);
  const prescriptionInputRef = useRef(null);
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
          fetch(DRUG_API_BASE_URL, {
            headers: getAuthHeaders(),
          }),
          fetch(CUSTOM_MED_API_BASE_URL, {
            headers: getAuthHeaders(),
          }),
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

  const resolveOrderStatus = (order) => normalizeDbOrderStatus(order?.orderStatus || order?.status || order?.order_status);

  const resolveOrderLabel = (order) => {
    const status = resolveOrderStatus(order);
    return DB_STATUS_TO_LABEL[status] || status;
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

  const submitOrder = async (orderItems, options = {}) => {
    const {
      clearCartOnSuccess = false,
      closeCartOnSuccess = false,
    } = options;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return;
    }

    try {
      setIsOrderLoading(true);
      setOrderError('');

      const payload = {
        customerId: customerData?.id ?? null,
        items: orderItems.map((item) => ({
          productId: item.id,
          productName: item.nama,
          productType: item.type,
          quantity: item.quantity,
          unitPrice: item.harga,
        })),
      };

      const formData = new FormData();
      formData.append('customerId', String(payload.customerId ?? ''));
      formData.append('items', JSON.stringify(payload.items));
      if (prescriptionFile) {
        formData.append('prescriptionImage', prescriptionFile);
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat pesanan.');
      }

      const createdOrder = result.data || {};
      const orderData = {
        id: createdOrder.id,
        orderStatus: normalizeDbOrderStatus(createdOrder.orderStatus),
        createdAt: createdOrder.createdAt || new Date().toISOString(),
        totalPrice: createdOrder.totalPrice ?? orderItems.reduce((total, item) => total + (item.harga * item.quantity), 0),
        items: orderItems.map((item) => ({
          drugName: item.nama,
          quantity: item.quantity,
          unitPrice: item.harga,
          subtotal: item.harga * item.quantity,
        })),
      };

      const nextOrderHistory = [
        ...orderHistory,
        {
          id: orderData.id,
          orderStatus: orderData.orderStatus,
          createdAt: orderData.createdAt,
          totalPrice: orderData.totalPrice,
          total_items: orderItems.reduce((total, item) => total + item.quantity, 0),
        },
      ];

      setOrderHistory(nextOrderHistory);
      if (clearCartOnSuccess) {
        setCart([]);
      }
      setPrescriptionFile(null);
      if (closeCartOnSuccess) {
        setIsCartOpen(false);
      }

      navigate('/order-success', { state: { orderData } });
    } catch (error) {
      setOrderError(error.message || 'Terjadi kesalahan saat checkout.');
    } finally {
      setIsOrderLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    await submitOrder(cart, {
      clearCartOnSuccess: true,
      closeCartOnSuccess: true,
    });
  };

  const handleBuyNow = async (item, type = 'custom') => {
    const buyNowItem = {
      ...item,
      type,
      quantity: 1,
    };

    await submitOrder([buyNowItem]);
  };

  const handlePrescriptionChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPrescriptionFile(file);
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
        ? [...result.data].sort((a, b) => {
          const aId = Number(a?.id ?? 0);
          const bId = Number(b?.id ?? 0);
          if (Number.isNaN(aId) || Number.isNaN(bId)) {
            return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
          }
          return aId - bId;
        })
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

  // ─── helpers ──────────────────────────────────────────────────
  const getStockClass = (stok) => {
    if (stok <= 0) return 'empty';
    if (stok <= 5) return 'low';
    return 'available';
  };

  const getStockLabel = (stok) => {
    if (stok <= 0) return 'Habis';
    if (stok <= 5) return `Sisa ${stok}`;
    return `Stok ${stok}`;
  };

  const statusClass = (order) => STATUS_COLORS[resolveOrderStatus(order)] || 'pending';

  const customerName = customerData?.name || customerData?.username || 'Customer';

  // ─── render ───────────────────────────────────────────────────
  return (
    <DashboardLayout onLogout={onLogout} userRole="customer" currentUser={customerData}>
      <div className="main-content">

        {/* ════ HERO BANNER ════ */}
        <div className="customer-hero-banner">
          <div className="hero-content">
            <h1 className="hero-greeting">Halo, {customerName}! 👋</h1>
            <p className="hero-subtitle">
              Temukan obat yang Anda butuhkan dengan mudah. Pesan sekarang, ambil nanti atau kirim ke rumah.
            </p>
            <div className="hero-stats">
              <div className="hero-stat-card">
                <div className="hero-stat-icon">🛒</div>
                <div>
                  <div className="hero-stat-value">{cartItemCount}</div>
                  <div className="hero-stat-label">Di Keranjang</div>
                </div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-icon">💊</div>
                <div>
                  <div className="hero-stat-value">{medicines.length + customMedicines.length}</div>
                  <div className="hero-stat-label">Produk Tersedia</div>
                </div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-icon">📦</div>
                <div>
                  <div className="hero-stat-value">{orderHistory.length}</div>
                  <div className="hero-stat-label">Total Pesanan</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ NAVIGATION TABS ════ */}
        <div className="customer-nav-tabs">
          <button
            className={`nav-tab-btn ${showCatalog ? 'active' : ''}`}
            onClick={() => setSearchParams({ tab: 'catalog', productTab: 'catalog' })}
          >
            <LocalPharmacyIcon sx={{ fontSize: 18, mr: 0.7, verticalAlign: 'sub' }} />
            Katalog Obat
          </button>
          <button
            className={`nav-tab-btn ${showCustom ? 'active' : ''}`}
            onClick={() => setSearchParams({ tab: 'catalog', productTab: 'custom' })}
          >
            <ScienceIcon sx={{ fontSize: 18, mr: 0.7, verticalAlign: 'sub' }} />
            Obat Racikan
          </button>
          <button
            className={`nav-tab-btn ${showHistory ? 'active' : ''}`}
            onClick={() => setSearchParams({ tab: 'history' })}
          >
            <HistoryIcon sx={{ fontSize: 18, mr: 0.7, verticalAlign: 'sub' }} />
            Riwayat
          </button>
          <button
            className={`nav-tab-btn ${showProfile ? 'active' : ''}`}
            onClick={() => setSearchParams({ tab: 'profile' })}
          >
            <PersonIcon sx={{ fontSize: 18, mr: 0.7, verticalAlign: 'sub' }} />
            Profil
          </button>
          <div className="nav-tab-spacer" />
          <button
            className="nav-tab-btn"
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(15,118,110,0.3)',
              position: 'relative',
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 18, mr: 0.7, verticalAlign: 'sub' }} />
            Keranjang
            {cartItemCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                minWidth: 20, height: 20, borderRadius: 10,
                background: '#ef4444', color: '#fff', fontSize: 11,
                fontWeight: 700, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '0 5px',
                border: '2px solid #fff',
              }}>
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* ════ PROFILE TAB ════ */}
        {showProfile && (
          <Card className="profile-modern-card" sx={{ p: 0, borderRadius: 4, overflow: 'hidden' }}>
            <Box className="profile-modern-hero">
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Avatar
                  sx={{ width: 72, height: 72, fontWeight: 700, bgcolor: '#0f766e', boxShadow: '0 10px 24px rgba(15,118,110,0.35)', fontSize: 28 }}
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
                <Alert severity={profileMessage.type || 'info'} sx={{ mb: 2, borderRadius: 3 }}>
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
                    sx={{ borderRadius: 3 }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    type="button"
                    disabled={isProfileSaving}
                    onClick={handleSaveProfile}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #0d6660 0%, #0c6680 100%)' },
                    }}
                  >
                    {isProfileSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Card>
        )}

        {/* ════ ORDER HISTORY ════ */}
        {showHistory && (
          <div className="section-card">
            <div className="section-title">
              <div className="section-title-icon catalog">
                <ReceiptLongIcon fontSize="small" />
              </div>
              Riwayat Pesanan
            </div>

            {orderError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{orderError}</Alert>
            )}
            {isOrderLoading && (
              <Typography color="text.secondary" mb={2}>Memuat pesanan...</Typography>
            )}

            {orderHistory.length === 0 && !isOrderLoading ? (
              <div className="empty-catalog-state">
                <div className="empty-catalog-icon">📭</div>
                <div className="empty-catalog-text">Belum ada pesanan. Yuk mulai belanja!</div>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2, borderRadius: 3,
                    background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
                  }}
                  onClick={() => setSearchParams({ tab: 'catalog', productTab: 'catalog' })}
                >
                  Mulai Belanja
                </Button>
              </div>
            ) : (
              orderHistory.map((order, index) => {
                const status = resolveOrderStatus(order);
                const sClass = statusClass(order);
                return (
                  <div className="order-history-card" key={order.id || index}>
                    <div className="order-card-top">
                      <div>
                        <div className="order-card-id">#{order.id}</div>
                        <div className="order-card-date">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
                        </div>
                      </div>
                      <span className={`status-chip ${sClass}`}>
                        <span className={`status-dot ${sClass}`} />
                        {resolveOrderLabel(order)}
                      </span>
                    </div>
                    <div className="order-card-bottom">
                      <div className="order-card-price">{formatCurrency(order.totalPrice ?? 0)}</div>
                      <div className="order-card-actions">
                        {order.paymentProofImageUrl && (
                          <Button
                            size="small"
                            variant="text"
                            component="a"
                            href={resolveProofImageUrl(order.paymentProofImageUrl)}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
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
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                          Detail
                        </Button>
                        {status === 'PENDING' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handlePayNow(order)}
                              disabled={payingOrderId === resolveNumericOrderId(order)}
                              sx={{
                                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                                background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
                              }}
                            >
                              Bayar
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              color="error"
                              onClick={() => handleCancelOrder(order)}
                              disabled={cancellingOrderId === resolveNumericOrderId(order)}
                              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                              Batalkan
                            </Button>
                          </>
                        )}
                        {status === 'VERIFIED' && (
                          <Chip label="Sedang diproses" size="small" color="info" variant="outlined" />
                        )}
                        {status === 'CANCELLED' && (
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            onClick={() => handleDeleteCancelledOrder(order)}
                            disabled={deletingOrderId === resolveNumericOrderId(order)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePaymentFileChange}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* ════ CATALOG / CUSTOM TAB ════ */}
        {(showCatalog || showCustom) && (
          <div className="section-card">
            <div className="section-title">
              <div className={`section-title-icon ${showCatalog ? 'catalog' : 'custom'}`}>
                {showCatalog
                  ? <LocalPharmacyIcon fontSize="small" />
                  : <ScienceIcon fontSize="small" />
                }
              </div>
              {showCatalog ? 'Katalog Obat' : 'Obat Racikan'}
            </div>

            {catalogMessage && (
              <Alert severity="error" className="catalog-msg-alert" sx={{ mb: 2 }}>
                {catalogMessage}
              </Alert>
            )}

            {/* Filters */}
            <Grid container spacing={1.5} mb={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Cari obat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      background: '#f8fafc',
                    },
                  }}
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
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
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
                  label="Harga"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                >
                  <MenuItem value="all">Semua Harga</MenuItem>
                  <MenuItem value="15000">≤ Rp 15.000</MenuItem>
                  <MenuItem value="30000">≤ Rp 30.000</MenuItem>
                  <MenuItem value="50000">≤ Rp 50.000</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={showCatalog ? 2.5 : 4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Urutkan"
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                >
                  <MenuItem value="default">Paling Relevan</MenuItem>
                  <MenuItem value="popular">Popularitas</MenuItem>
                  <MenuItem value="price_low">Harga Termurah</MenuItem>
                  <MenuItem value="price_high">Harga Termahal</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Product Grid */}
            {(showCatalog ? filteredMedicines : filteredCustomMedicines).length === 0 ? (
              <div className="empty-catalog-state">
                <div className="empty-catalog-icon">🔍</div>
                <div className="empty-catalog-text">
                  Tidak ada produk ditemukan. Coba ubah filter atau kata kunci pencarian.
                </div>
              </div>
            ) : (
              <Grid container spacing={2.5}>
                {(showCatalog ? filteredMedicines : filteredCustomMedicines).map((medicine) => (
                  <Grid item xs={12} sm={6} lg={4} key={medicine.id}>
                    <Card className="product-card-modern" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* accent strip */}
                      <div className={`product-card-accent ${showCatalog ? '' : 'custom'}`} />

                      <CardContent className="product-card-body" sx={{ flex: 1, pb: 0 }}>
                        <div className="product-card-header">
                          <div className="product-card-name">{medicine.nama}</div>
                          <span className={`product-card-category ${showCatalog ? 'regular' : 'custom'}`}>
                            {showCatalog ? medicine.kategori : 'Racikan'}
                          </span>
                        </div>

                        {!showCatalog && medicine.deskripsi && (
                          <div className="product-card-desc">{medicine.deskripsi}</div>
                        )}

                        <div className="product-card-price">{formatCurrency(medicine.harga)}</div>

                        <div className="product-card-stock">
                          <span className={`stock-dot ${getStockClass(medicine.stok)}`} />
                          <span style={{ color: medicine.stok <= 0 ? '#ef4444' : medicine.stok <= 5 ? '#f59e0b' : '#22c55e' }}>
                            {getStockLabel(medicine.stok)}
                          </span>
                        </div>
                      </CardContent>

                      <CardActions className="product-card-actions" sx={{ pt: 0 }}>
                        {showCatalog ? (
                          <Button
                            fullWidth
                            className="add-cart-btn primary"
                            disabled={isOrderLoading || medicine.stok <= 0}
                            onClick={() => addToCart(medicine, 'regular')}
                          >
                            {medicine.stok <= 0 ? 'Stok Habis' : '+ Tambah ke Keranjang'}
                          </Button>
                        ) : (
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} width="100%">
                            <Button
                              fullWidth
                              className="add-cart-btn secondary"
                              disabled={isOrderLoading || medicine.stok <= 0}
                              onClick={() => addToCart(medicine, 'custom')}
                            >
                              + Keranjang
                            </Button>
                            <Button
                              fullWidth
                              className="add-cart-btn buy-now"
                              disabled={isOrderLoading || medicine.stok <= 0}
                              onClick={() => handleBuyNow(medicine, 'custom')}
                            >
                              Beli Sekarang
                            </Button>
                          </Stack>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        )}

        {/* ════ ORDER DETAIL DIALOG ════ */}
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
                    <span className={`status-chip ${statusClass(selectedOrder)}`}>
                      <span className={`status-dot ${statusClass(selectedOrder)}`} />
                      {resolveOrderLabel(selectedOrder)}
                    </span>
                  )}
                  <IconButton size="small" onClick={closeOrderDetail}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              {isDetailLoading && (
                <Typography color="text.secondary">Memuat detail pesanan...</Typography>
              )}

              {!isDetailLoading && detailError && (
                <Alert severity="error" sx={{ borderRadius: 3 }}>{detailError}</Alert>
              )}

              {!isDetailLoading && !detailError && selectedOrder && (
                <>
                  <Typography color="text.secondary" mb={2} fontSize={14}>
                    ID: {selectedOrder.id} &nbsp;|&nbsp; {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('id-ID') : '-'}
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
                            primary={item.drugName || `Item #${index + 1}`}
                            secondary={`Qty ${item.quantity} x ${formatCurrency(item.unitPrice)}`}
                          />
                          <Typography fontWeight={700} color="#0f766e">{formatCurrency(item.subtotal)}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography fontWeight={600}>Total Harga</Typography>
                    <Typography fontWeight={800} fontSize={18} color="#0f766e">
                      {formatCurrency(selectedOrder.totalPrice ?? 0)}
                    </Typography>
                  </Stack>
                </>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ════ FLOATING CART FAB ════ */}
      {(showCatalog || showCustom) && cartItemCount > 0 && (
        <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
          <ShoppingCartIcon />
          <span className="cart-fab-badge">{cartItemCount}</span>
        </button>
      )}

      {/* ════ CART DRAWER ════ */}
      <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <Box sx={{ width: { xs: 340, sm: 420 }, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <div className="cart-drawer-header">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <div>
                <div className="cart-drawer-title">🛒 Keranjang Belanja</div>
                <div className="cart-drawer-subtitle">{cartItemCount} item di keranjang</div>
              </div>
              <IconButton onClick={() => setIsCartOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </div>

          <Divider sx={{ mt: 2 }} />

          {orderError && (
            <Alert severity="error" sx={{ m: 2, borderRadius: 3 }}>{orderError}</Alert>
          )}

          {/* Body */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 1.5 }}>
            {cartItemCount === 0 ? (
              <div className="cart-empty-state">
                <div className="cart-empty-icon">
                  <ShoppingBagIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
                </div>
                <div className="cart-empty-text">Keranjang masih kosong</div>
                <Typography fontSize={13} color="#94a3b8" mt={0.5}>
                  Tambahkan obat dari katalog untuk memulai
                </Typography>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item-card" key={`${item.id}-${item.type}`}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                    <div>
                      <div className="cart-item-name">{item.nama}</div>
                      <div className="cart-item-price">{formatCurrency(item.harga)} / item</div>
                    </div>
                    <IconButton size="small" color="error" onClick={() => updateQuantity(item.id, item.type, 0)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                    <div className="cart-qty-control">
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}>
                        <RemoveIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}>
                        <AddIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </div>
                    <div className="cart-item-subtotal">{formatCurrency(item.harga * item.quantity)}</div>
                  </Stack>
                </div>
              ))
            )}
          </Box>

          {/* Footer / Summary */}
          <div className="cart-summary-section">
            {/* Prescription upload */}
            <Box mb={2}>
              <Typography fontSize={13} fontWeight={600} color="#475569" mb={1}>
                📋 Upload Resep Dokter (Opsional)
              </Typography>
              {prescriptionFile ? (
                <div className="prescription-file-info">
                  <span className="prescription-file-name">📎 {prescriptionFile.name}</span>
                  <IconButton size="small" onClick={() => setPrescriptionFile(null)}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </div>
              ) : (
                <div
                  className="prescription-upload-area"
                  onClick={() => prescriptionInputRef.current?.click()}
                >
                  <div className="prescription-upload-icon">
                    <CloudUploadIcon sx={{ fontSize: 28, color: '#94a3b8' }} />
                  </div>
                  <div className="prescription-upload-text">Klik untuk upload resep</div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={prescriptionInputRef}
                onChange={handlePrescriptionChange}
                style={{ display: 'none' }}
              />
            </Box>

            <div className="cart-summary-row">
              <span className="cart-summary-label">Subtotal</span>
              <span className="cart-summary-value">{formatCurrency(cartTotal)}</span>
            </div>
            <Divider sx={{ my: 1 }} />
            <div className="cart-summary-row">
              <span className="cart-summary-total">Total Bayar</span>
              <span className="cart-summary-total" style={{ color: '#0f766e' }}>
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <Button
              className="cart-checkout-btn"
              disabled={cartItemCount === 0 || isOrderLoading}
              onClick={handleCheckout}
            >
              {isOrderLoading ? 'Memproses...' : `Checkout (${cartItemCount} item)`}
            </Button>
          </div>
        </Box>
      </Drawer>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
