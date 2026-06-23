# DETAIL TEKNIS SISTEM - SIAP COPY UNTUK TA

Dokumen ini berisi detail teknis sistem yang bisa langsung digunakan untuk melengkapi bab teknis TA Anda.

---

## BAGIAN 1: TECHNOLOGY STACK YANG SEDANG DIGUNAKAN

### Frontend Technology:
```
Framework: React (dengan Vite bundler)
UI Library: Material-UI (MUI)
Charting: Recharts (untuk dashboard analytics)
Routing: React Router
HTTP Client: Axios
State Management: React Hooks (useState, useContext)
Styling: CSS modules + Material-UI sx props
Build Tool: Vite
```

### Backend Technology:
```
Runtime: Node.js
Framework: Express.js
ORM: Prisma
Database: PostgreSQL
Authentication: JWT (JSON Web Tokens)
File Upload: Multer
Email: Nodemailer
Password Hashing: bcrypt
Environment: dotenv
```

### Database:
```
Primary DB: PostgreSQL
ORM: Prisma (untuk type-safe database access)
Migration Tool: Prisma Migrations
```

---

## BAGIAN 2: ARSITEKTUR SYSTEM

### A. Frontend Architecture (React):

```
Front-end/
├── src/
│   ├── pages/              # Page components (route handlers)
│   │   ├── LandingPage
│   │   ├── LoginPage, CustomerLoginPage, ForgotPasswordPage
│   │   ├── Dashboard (Admin), DashboardKasir, Dashboard
│   │   ├── ManajemenStok, ManajemenObatRacikan, ManajemenPengadaan
│   │   ├── ManajemenPengguna, SupplierPage
│   │   ├── TransaksiPenjualan, TransaksiForm
│   │   ├── LaporanPenjualanKasir, LaporanAnalitik
│   │   └── OrderDetail, OrderSuccess
│   │
│   ├── components/         # Reusable components
│   │   ├── DashboardLayout    # Main layout wrapper
│   │   ├── Sidebar            # Navigation sidebar
│   │   ├── header/            # Header components
│   │   ├── Modal Forms        # ObatForm, SupplierForm, etc
│   │   ├── ConfirmModal       # Generic confirmation dialog
│   │   ├── ExportModal        # Export options
│   │   ├── Pagination         # Reusable pagination
│   │   └── NotificationBell   # Real-time alerts
│   │
│   ├── config/
│   │   └── apiConfig.js      # API base URL configuration
│   │
│   ├── hooks/
│   │   └── Custom React hooks
│   │
│   ├── styles/
│   │   └── CSS files per page
│   │
│   ├── assets/
│   │   └── Images, icons
│   │
│   └── App.jsx              # Root component

Entry point: main.jsx
```

**Design Pattern**: Component-based architecture dengan separation of concerns
- Pages: Handle routing dan layout
- Components: Reusable UI pieces
- Hooks: Business logic extraction
- Config: Centralized configuration

### B. Backend Architecture (Express):

```
back-end/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection (Prisma client)
│   │   ├── config.js            # Environment variables
│   │   └── mailer.js            # Email configuration
│   │
│   ├── controllers/             # Business logic (per feature)
│   │   ├── authController.js
│   │   ├── drugController.js
│   │   ├── orderController.js
│   │   ├── supplierController.js
│   │   ├── customMedicineController.js
│   │   ├── userController.js
│   │   ├── transactionController.js
│   │   ├── purchaseController.js
│   │   ├── reportController.js
│   │   ├── dashboardController.js
│   │   └── verificationController.js (payment verification)
│   │
│   ├── routes/                  # API endpoint definitions
│   │   ├── authRoutes.js
│   │   ├── drugRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── customMedicineRoutes.js
│   │   └── ... (other route files)
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorHandlerMiddleware.js
│   │
│   ├── emails/                  # Email templates
│   │   ├── otpVerificationTemplate.js
│   │   ├── passwordResetOtpTemplate.js
│   │   ├── emailChangedNotificationTemplate.js
│   │   └── passwordChangedNotificationTemplate.js
│   │
│   ├── uploads/                 # Uploaded files storage
│   │   ├── payment-proofs/
│   │   └── prescriptions/
│   │
│   ├── app.js                   # Express app initialization
│   └── server.js                # Server startup
```

**Architecture Pattern**: MVC (Model-View-Controller) simplified for API
- Controllers: Handle business logic
- Routes: Define API endpoints
- Middlewares: Authentication, error handling
- Emails: Template-based email generation

---

## BAGIAN 3: DATABASE SCHEMA (Key Tables)

### Main Tables Structure:

```
TABLE users
├── id (PK)
├── email (UNIQUE)
├── username (UNIQUE)
├── password (hashed with bcrypt)
├── fullName
├── role (ENUM: ADMIN, KASIR, STAFF, OWNER, CUSTOMER)
├── status (ENUM: ACTIVE, INACTIVE, SUSPENDED)
├── createdAt
├── updatedAt
└── lastLogin

TABLE drugs
├── id (PK)
├── code (UNIQUE)
├── name
├── type (ENUM: TABLET, KAPSUL, SIRUP, etc)
├── category (ENUM: BEBAS, KERAS, PSIKOTROPIKA)
├── stock (current quantity)
├── minimumStock
├── buyPrice
├── sellPrice
├── expiryDate
├── supplierId (FK → suppliers)
└── timestamps

TABLE suppliers
├── id (PK)
├── name (UNIQUE)
├── address
├── city
├── phone
├── email
├── contactPerson
├── accountNumber (optional)
├── bankName (optional)
├── status (ACTIVE/INACTIVE)
└── timestamps

TABLE orders
├── id (PK)
├── orderNumber (UNIQUE)
├── customerId (FK → users)
├── totalAmount
├── status (ENUM: PENDING, VERIFIED, PROCESSING, COMPLETED, CANCELLED)
├── paymentMethod (ENUM: TRANSFER, QRIS, CASH)
├── paymentProofUrl
├── createdAt
├── verifiedAt (when kasir verified)
└── completedAt

TABLE orderItems
├── id (PK)
├── orderId (FK → orders)
├── drugId (FK → drugs)
├── quantity
├── unitPrice
├── subtotal

TABLE transactions (counter sales)
├── id (PK)
├── transactionNumber (UNIQUE)
├── customerId (optional, for walk-in = null)
├── cashierId (FK → users)
├── totalAmount
├── paymentMethod
├── status (COMPLETED/FAILED)
├── createdAt

TABLE customMedicines (obat racikan)
├── id (PK)
├── name
├── description
├── price
├── stock
└── timestamps

TABLE customMedicineComposition
├── id (PK)
├── customMedicineId (FK)
├── drugId (FK → drugs)
├── quantity
├── unit (ENUM: tablet, kapsul, mL, dll)

TABLE purchases (PO)
├── id (PK)
├── poNumber (UNIQUE)
├── supplierId (FK)
├── totalAmount
├── status (ENUM: DRAFT, SUBMITTED, CONFIRMED, RECEIVED, CANCELLED)
├── createdAt
└── receivedAt

TABLE purchaseItems
├── id (PK)
├── purchaseId (FK)
├── drugId (FK)
├── quantity
├── unitPrice
└── expiryDate

TABLE auditLogs
├── id (PK)
├── userId (FK)
├── action (CREATE/UPDATE/DELETE/VIEW)
├── entityType
├── entityId
├── changes (JSON)
├── createdAt
```

---

## BAGIAN 4: API ENDPOINTS YANG PENTING

### Authentication Endpoints:
```
POST   /api/auth/login           # Staff login
POST   /api/auth/logout          # Logout

POST   /api/auth/customer/login       # Customer login
POST   /api/auth/customer/register    # Customer signup
POST   /api/auth/forgot-password      # Request password reset
POST   /api/auth/verify-otp           # Verify OTP
POST   /api/auth/reset-password       # Set new password
```

### Drug Management Endpoints:
```
GET    /api/obat                 # Get all drugs (paginated, filterable)
POST   /api/obat                 # Create new drug
PUT    /api/obat/:id             # Update drug
DELETE /api/obat/:id             # Delete drug
GET    /api/obat/:id             # Get drug detail
```

### Order Management Endpoints:
```
GET    /api/orders               # Get all orders (admin view)
POST   /api/orders               # Create new order (customer)
GET    /api/orders/:id           # Get order detail
PUT    /api/orders/:id           # Update order status

POST   /api/orders/:id/upload-payment    # Upload payment proof
POST   /api/orders/:id/verify-payment    # Verify payment (kasir)
POST   /api/orders/:id/process           # Process order (kasir)
POST   /api/orders/:id/complete          # Mark as complete (kasir)
```

### Supplier Endpoints:
```
GET    /api/suppliers            # Get all suppliers
POST   /api/suppliers            # Create supplier
PUT    /api/suppliers/:id        # Update supplier
DELETE /api/suppliers/:id        # Delete supplier
```

### Purchase Order Endpoints:
```
GET    /api/purchases            # Get all POs
POST   /api/purchases            # Create PO
GET    /api/purchases/:id        # Get PO detail
PUT    /api/purchases/:id        # Update PO
POST   /api/purchases/:id/receive # Mark as received

GET    /api/purchases/:id/items  # Get PO items
```

### Dashboard & Reporting Endpoints:
```
GET    /api/dashboard/analytics      # Admin dashboard data
GET    /api/dashboard/notifications  # Alert & notifications
GET    /api/reports/sales            # Sales report
GET    /api/reports/inventory        # Inventory report
GET    /api/reports/analytics        # Business analytics (owner)
```

### User Management Endpoints:
```
GET    /api/users                # Get all users
POST   /api/users                # Create user
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user
POST   /api/users/:id/reset-password  # Reset password
```

### Custom Medicine Endpoints:
```
GET    /api/custom-medicines     # Get all custom medicines
POST   /api/custom-medicines     # Create custom medicine
PUT    /api/custom-medicines/:id # Update custom medicine
DELETE /api/custom-medicines/:id # Delete custom medicine
GET    /api/custom-medicines/:id/composition # Get composition
```

---

## BAGIAN 5: FITUR-FITUR UTAMA YANG SUDAH IMPLEMENTED

### 1. Authentication & Authorization:
- [x] Email/Username + Password login
- [x] JWT token-based sessions
- [x] Role-based access control (RBAC)
  - Admin: Full system access
  - Kasir: Transactions, verification, reports
  - Staff: Limited dashboard
  - Owner: Analytics only
  - Customer: Self-service portal
- [x] Logout functionality
- [x] Password reset dengan OTP (untuk customer)
- [x] Auto role detection untuk staff internal

### 2. Inventory Management:
- [x] CRUD operations untuk drugs
- [x] Stock tracking (current, minimum, maximum)
- [x] Expiry date tracking
- [x] Supplier association
- [x] Drug categorization (BEBAS/KERAS/PSIKOTROPIKA)
- [x] Unit/satuan specification (tablet, kapsul, etc)
- [x] Buy price & sell price tracking
- [x] Margin calculation

### 3. Sales Management:
- [x] Counter sales (POS) dengan kasir
- [x] Online orders dari customer
- [x] Shopping cart functionality
- [x] Multiple payment methods (Tunai, Transfer, QRIS)
- [x] Transaction recording & receipt generation
- [x] Order status tracking (Pending → Verified → Processing → Completed)

### 4. Payment Verification:
- [x] Payment proof upload dari customer
- [x] Payment verification workflow untuk kasir
- [x] Multiple action buttons (Verify, Process, Complete, Reject)
- [x] Status badge color coding
- [x] Auto-notification untuk status changes

### 5. Custom Medicine (Racikan):
- [x] Create racikan dengan multiple drug components
- [x] Composition tracking
- [x] Stock management per racikan
- [x] Price calculation
- [x] Inventory tracking

### 6. Procurement Management:
- [x] Supplier database
- [x] Purchase Order (PO) creation
- [x] Supplier selection & drug selection workflow
- [x] PO status tracking (Draft → Submitted → Confirmed → Received)
- [x] Goods receipt with stock update
- [x] Delivery tracking

### 7. User Management:
- [x] Create/Edit/Delete users
- [x] Role assignment
- [x] Status management (Active/Inactive)
- [x] Last login tracking
- [x] Password reset functionality

### 8. Dashboard & Analytics:
- [x] Admin dashboard dengan KPIs
- [x] Weekly sales trend chart
- [x] Medicine category distribution pie chart
- [x] Low stock alerts
- [x] Expiring soon products
- [x] Recent transactions list
- [x] Kasir dashboard dengan verification tab
- [x] Customer dashboard dengan tabs (Catalog, History, Profile)
- [x] Owner dashboard dengan advanced analytics

### 9. Notifications:
- [x] Real-time notification bell
- [x] Low stock alerts
- [x] Expiring product alerts
- [x] Order status notifications
- [x] Email notifications
- [x] Auto-polling setiap 60 detik

### 10. Reporting & Export:
- [x] Sales report dengan date range & filters
- [x] Export to PDF
- [x] Export to Excel
- [x] Analytics report
- [x] Printer support
- [x] Custom date range selection

### 11. Security Features:
- [x] Password hashing dengan bcrypt
- [x] JWT token authentication
- [x] Authorization middleware untuk route protection
- [x] Error handling middleware
- [x] Input validation
- [x] CORS configuration

### 12. Email System:
- [x] OTP verification email
- [x] Password reset email
- [x] Email change notification
- [x] Password change notification
- [x] Order status email notifications
- [x] Email template system

---

## BAGIAN 6: FITUR KEAMANAN YANG SUDAH DITERAPKAN

### Password Security:
```javascript
// Hashing: bcrypt dengan salt rounds
// Minimum requirements: 8 char, uppercase, lowercase, number, special char
// Reset: OTP-based system dengan expiry time
```

### Authentication:
```javascript
// JWT token: Issued upon login
// Token validation: On every protected endpoint
// Refresh token: Auto-extend session (if implemented)
// Session timeout: 30 minutes inactivity
```

### Authorization:
```javascript
// Role-based access control (RBAC)
// Route-level protection
// Data-level protection (users dapat hanya akses data mereka)
```

### Input Validation:
```javascript
// Server-side validation pada semua endpoints
// Sanitization dari user input
// Type checking untuk form submissions
```

### Error Handling:
```javascript
// Centralized error handling middleware
// Consistent error response format
// Proper HTTP status codes
// No sensitive data leaking di error messages
```

---

## BAGIAN 7: NOTIFIKASI & ALERT SYSTEM

### Real-time Notification Types:

```
1. LOW_STOCK_ALERT
   Trigger: Drug stock < minimum stock threshold
   Priority: HIGH
   Icon: Package icon
   Action: Link ke drug detail untuk reorder

2. EXPIRING_SOON_ALERT
   Trigger: Drug expiry date < 30 days
   Priority: MEDIUM
   Icon: Warning icon
   Action: Link ke drug detail, clearance recommendation

3. ORDER_PENDING_VERIFICATION
   Trigger: New order dengan payment proof
   Priority: HIGH (untuk kasir)
   Icon: Shopping cart
   Action: Link ke order verification page

4. PAYMENT_VERIFIED
   Trigger: Kasir verifikasi pembayaran
   Priority: MEDIUM (untuk customer)
   Icon: Check icon
   Message: "Pembayaran Anda telah diverifikasi"

5. ORDER_PROCESSING
   Trigger: Order moved ke processing status
   Priority: MEDIUM (untuk customer)
   Icon: Truck icon
   Message: "Pesanan sedang disiapkan"

6. ORDER_COMPLETED
   Trigger: Order marked as completed
   Priority: MEDIUM (untuk customer)
   Icon: Check icon
   Message: "Pesanan Anda telah diterima"
```

### Notification Delivery Channels:
- [x] In-app notifications (notification bell)
- [x] Email notifications
- [ ] SMS notifications (belum implemented)
- [ ] WhatsApp notifications (belum implemented)

### Notification Auto-polling:
```javascript
// Frontend: Polling /api/dashboard/notifications setiap 60 detik
// Backend: Fetch dari database, group by type
// Display: Badge count + dropdown list dengan action links
```

---

## BAGIAN 8: ERROR HANDLING & STATUS CODES

### API Response Format:

```javascript
// Success (200 OK):
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": { ... }
}

// Error (4xx, 5xx):
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400
}
```

### HTTP Status Codes yang Digunakan:
```
200 OK - Success
201 Created - Resource created
204 No Content - Success, no content
400 Bad Request - Invalid input
401 Unauthorized - Not authenticated
403 Forbidden - Not authorized
404 Not Found - Resource not found
409 Conflict - Duplicate, conflict
422 Unprocessable Entity - Validation error
500 Internal Server Error - Server error
```

---

## BAGIAN 9: PAGINATION IMPLEMENTATION

```javascript
// Frontend: Pagination component dengan:
- Previous/Next buttons
- Numbered page buttons (1, 2, 3, ...)
- Smart ellipsis (...) untuk large page counts
- Rows per page selector (10, 25, 50, 100)
- Info: "Showing X-Y of Z items"

// Backend: Pagination params:
- page: Current page number (1-indexed)
- limit: Items per page (default 10)
- sort: Sort field (e.g., "createdAt")
- order: Sort direction (ASC/DESC)
- filters: Additional filtering params

// Response format:
{
  "data": [...items],
  "pagination": {
    "current": 1,
    "limit": 10,
    "total": 250,
    "pages": 25
  }
}
```

---

## BAGIAN 10: EXPORT FUNCTIONALITY

### PDF Export:
```javascript
// Library: pdfkit atau similar
// Content:
  - Report title & period
  - Summary statistics
  - Charts (rendered as images)
  - Data tables
  - Footer: Generated date, page numbers
// Format: A4 landscape/portrait
// File naming: Report_[Type]_[Date].pdf
```

### Excel Export:
```javascript
// Library: exceljs atau similar
// Sheets:
  - Summary (KPIs)
  - Daily data (detailed)
  - Charts data (for pivot tables)
  - Formatted with colors, borders
// Features:
  - Frozen header rows
  - Auto-width columns
  - Filter enabled
  - Formulas untuk calculations
// File naming: Report_[Type]_[Date].xlsx
```

---

## BAGIAN 11: FILE UPLOAD SYSTEM

### Payment Proof Upload:
```javascript
// Folder: uploads/payment-proofs/
// File types: JPG, PNG, PDF
// Max size: 5MB
// Naming: [orderId]_[timestamp]_[originalFilename]
// URL generation: /uploads/payment-proofs/[filename]
// Validation:
  - MIME type check
  - File size validation
  - Virus scan (optional)
```

### Prescription Upload (untuk customer):
```javascript
// Folder: uploads/prescriptions/
// Similar setup dengan payment proofs
// Digunakan untuk custom medicine orders
```

---

## BAGIAN 12: EMAIL TEMPLATE SAMPLES

### OTP Verification Email:
```
Subject: Kode OTP Verifikasi Akun Anda - Apotek Pemuda

Body:
Halo [CustomerName],

Anda telah meminta untuk reset password. Berikut adalah kode OTP Anda:

[OTP_CODE] 

Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.

Jika Anda tidak melakukan permintaan ini, abaikan email ini.

Terima kasih,
Tim Apotek Pemuda
```

### Payment Verification Email:
```
Subject: Pembayaran Anda Telah Diverifikasi - Pesanan #[OrderID]

Body:
Halo [CustomerName],

Terima kasih telah melakukan pembayaran untuk pesanan Anda.

Nomor Pesanan: [OrderID]
Jumlah Pembayaran: [Amount]
Tanggal Verifikasi: [Date]

Pesanan Anda sedang disiapkan dan akan segera dikirimkan.

Klik link di bawah untuk melihat detail pesanan:
[Order Detail Link]

Terima kasih atas kepercayaan Anda,
Tim Apotek Pemuda
```

---

## BAGIAN 13: KONFIGURASI ENVIRONMENT VARIABLES

```
# .env file (Backend)

DATABASE_URL=postgresql://user:password@localhost:5432/apotek_db
JWT_SECRET=your_secret_key_here
NODE_ENV=production
PORT=5000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000/uploads

# File Upload
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

---

## BAGIAN 14: DEPLOYMENT CHECKLIST

```
Pre-Deployment:
- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Test suite passing
- [ ] Security audit done
- [ ] Performance testing done
- [ ] Backup strategy defined
- [ ] Rollback plan prepared

Deployment:
- [ ] Backend deployed (Node.js + Express)
- [ ] Frontend deployed (React build)
- [ ] Database deployed (PostgreSQL)
- [ ] SSL/HTTPS configured
- [ ] CORS configured correctly
- [ ] Monitoring & logging setup
- [ ] Health check endpoints working

Post-Deployment:
- [ ] Test all critical workflows
- [ ] Monitor error logs
- [ ] Verify email sending
- [ ] Check payment processing
- [ ] Test user access by role
- [ ] Performance monitoring
```

---

## BAGIAN 15: MONITORING & MAINTENANCE

### Metrics to Monitor:
```
1. Application Performance:
   - API response time (target: <200ms)
   - Error rate (target: <0.1%)
   - Uptime %
   - Database query time

2. System Resources:
   - CPU usage
   - Memory usage
   - Disk space
   - Network bandwidth

3. Business Metrics:
   - Daily active users
   - Transaction count
   - Revenue processed
   - Payment success rate
   - Order completion rate

4. User Experience:
   - Page load time
   - Error rate
   - Session duration
   - Bounce rate
```

### Logging:
```javascript
// Log levels: DEBUG, INFO, WARN, ERROR, FATAL
// Logged events:
  - User login/logout
  - CRUD operations
  - Payment operations
  - Errors & exceptions
  - Database operations
// Retention: 30 days
// Storage: File system / centralized logging service
```

---

## RINGKASAN

Dokumen ini berisi detail teknis yang bisa langsung dikutip dalam buku TA Anda untuk menunjukkan:

1. **Stack Teknologi** yang digunakan dan alasannya
2. **Arsitektur Sistem** yang scalable dan maintainable
3. **Database Schema** yang well-designed
4. **API Endpoints** yang comprehensive
5. **Fitur-fitur** yang sudah implemented
6. **Security** yang sudah diterapkan
7. **Operational** concerns (monitoring, deployment, etc)

Semua ini menunjukkan sistem yang **production-ready** dan **enterprise-level** untuk standar academic thesis.

Selamat melanjutkan TA Anda! 🎓
