import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const cuid = () =>
  `seed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱 Memulai proses seeding database...\n');

  // =========================================================================
  // 1. USERS
  // =========================================================================
  console.log('👤 Seeding users...');

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@apotek.local',
      password: '123456',
      role: 'ADMIN',
      phone: '081200000001',
      address: 'Jl. Kesehatan No. 1, Jakarta',
      isMember: false,
    },
  });

  const kasir = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      username: 'kasir',
      email: 'kasir@apotek.local',
      password: '123456',
      role: 'KASIR',
      phone: '081200000002',
      address: 'Jl. Melati No. 5, Jakarta',
      isMember: false,
    },
  });

  const customer = await prisma.user.upsert({
    where: { username: 'customer' },
    update: {},
    create: {
      username: 'customer',
      email: 'customer@apotek.local',
      password: '123456',
      role: 'CUSTOMER',
      phone: '081200000003',
      address: 'Jl. Mawar No. 10, Jakarta',
      isMember: true,
      membershipStatus: 'active',
    },
  });

  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      email: 'owner@apotek.local',
      password: '123456',
      role: 'OWNER',
      phone: '081200000004',
      address: 'Jl. Pemuda No. 77, Jakarta',
      isMember: false,
    },
  });

  console.log(`  ✅ Users berhasil dibuat: ${[admin, kasir, customer, owner].map((u) => u.username).join(', ')}\n`);

  // =========================================================================
  // 2. SUPPLIERS
  // =========================================================================
  console.log('🏭 Seeding suppliers...');

  const supplierKimiaFarma = await prisma.supplier.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'PT Kimia Farma',
      contactPerson: 'Budi Santoso',
      phone: '02111223344',
      email: 'pengadaan@kimiafarma.co.id',
      address: 'Jl. Veteran No. 9, Jakarta Pusat 10110',
    },
  });

  const supplierBioFarma = await prisma.supplier.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'PT Bio Farma',
      contactPerson: 'Siti Rahayu',
      phone: '02244556677',
      email: 'supply@biofarma.co.id',
      address: 'Jl. Pasteur No. 28, Bandung 40161',
    },
  });

  const supplierSanbe = await prisma.supplier.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'PT Sanbe Farma',
      contactPerson: 'Ahmad Fauzi',
      phone: '02255443322',
      email: 'order@sanbe.co.id',
      address: 'Jl. Industri No. 4, Cimahi, Bandung 40526',
    },
  });

  console.log(
    `  ✅ Suppliers berhasil dibuat: ${[supplierKimiaFarma, supplierBioFarma, supplierSanbe].map((s) => s.name).join(', ')}\n`
  );

  // =========================================================================
  // 3. DRUGS (tanpa supplierId — hubungan via PurchaseDetail)
  // =========================================================================
  console.log('💊 Seeding drugs...');

  const paracetamol = await prisma.drug.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Paracetamol 500mg',
      description: 'Analgesik dan antipiretik untuk meredakan nyeri dan demam.',
      stock: 200,
      unit: 'tablet',
      price: 1500,
      expiredDate: new Date('2027-06-30'),
    },
  });

  const amoxicillin = await prisma.drug.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Amoxicillin 500mg',
      description: 'Antibiotik golongan penisilin untuk infeksi bakteri.',
      stock: 150,
      unit: 'kapsul',
      price: 3500,
      expiredDate: new Date('2026-12-31'),
    },
  });

  const cetirizine = await prisma.drug.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Cetirizine 10mg',
      description: 'Antihistamin generasi kedua untuk alergi dan rhinitis.',
      stock: 100,
      unit: 'tablet',
      price: 5000,
      expiredDate: new Date('2027-03-31'),
    },
  });

  const omeprazole = await prisma.drug.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Omeprazole 20mg',
      description: 'Proton pump inhibitor untuk asam lambung dan GERD.',
      stock: 80,
      unit: 'kapsul',
      price: 7000,
      expiredDate: new Date('2026-09-30'),
    },
  });

  const metformin = await prisma.drug.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Metformin 500mg',
      description: 'Antidiabetik oral lini pertama untuk diabetes tipe 2.',
      stock: 120,
      unit: 'tablet',
      price: 4000,
      expiredDate: new Date('2027-01-31'),
    },
  });

  const allDrugs = [paracetamol, amoxicillin, cetirizine, omeprazole, metformin];
  console.log(`  ✅ Drugs berhasil dibuat: ${allDrugs.map((d) => d.name).join(', ')}\n`);

  // =========================================================================
  // 4. CUSTOM MEDICINES (obat racikan)
  // =========================================================================
  console.log('🔬 Seeding custom medicines...');

  // Hapus komponen lama jika racikan sudah ada agar tidak duplikasi
  const existingObarRacikan = await prisma.customMedicine.findFirst({
    where: { name: 'Racikan Batuk Pilek Anak' },
  });

  const obatRacikan = existingObarRacikan
    ? existingObarRacikan
    : await prisma.customMedicine.create({
        data: {
          name: 'Racikan Batuk Pilek Anak',
          price: 25000,
          stock: 30,
          components: {
            create: [
              {
                // Paracetamol sebagai komponen
                drugId: paracetamol.id,
                quantity: 10,
                unit: 'tablet',
              },
              {
                // Cetirizine sebagai komponen
                drugId: cetirizine.id,
                quantity: 5,
                unit: 'tablet',
              },
            ],
          },
        },
      });

  console.log(`  ✅ Custom medicine berhasil dibuat: ${obatRacikan.name}\n`);

  // =========================================================================
  // 5. PURCHASES (pengadaan dari supplier ke apotek)
  // =========================================================================
  console.log('📦 Seeding purchases...');

  // Pengadaan 1: PT Kimia Farma kirim Paracetamol & Amoxicillin
  const purchase1 = await prisma.purchase.create({
    data: {
      purchaseCode: `PO-${cuid()}`,
      supplierId: supplierKimiaFarma.id,
      totalPrice: 200 * 1200 + 150 * 3000, // harga beli (beda dari harga jual)
      details: {
        create: [
          {
            drugId: paracetamol.id,
            quantity: 200,
            unitPrice: 1200,
            subtotal: 200 * 1200,
          },
          {
            drugId: amoxicillin.id,
            quantity: 150,
            unitPrice: 3000,
            subtotal: 150 * 3000,
          },
        ],
      },
    },
    include: { details: true },
  });

  // Pengadaan 2: PT Bio Farma kirim Cetirizine, Omeprazole & Metformin
  const purchase2 = await prisma.purchase.create({
    data: {
      purchaseCode: `PO-${cuid()}`,
      supplierId: supplierBioFarma.id,
      totalPrice: 100 * 4200 + 80 * 5800 + 120 * 3200,
      details: {
        create: [
          {
            drugId: cetirizine.id,
            quantity: 100,
            unitPrice: 4200,
            subtotal: 100 * 4200,
          },
          {
            drugId: omeprazole.id,
            quantity: 80,
            unitPrice: 5800,
            subtotal: 80 * 5800,
          },
          {
            drugId: metformin.id,
            quantity: 120,
            unitPrice: 3200,
            subtotal: 120 * 3200,
          },
        ],
      },
    },
    include: { details: true },
  });

  console.log(
    `  ✅ Purchases berhasil dibuat:\n` +
    `     - ${purchase1.purchaseCode} (${supplierKimiaFarma.name}): ${purchase1.details.length} item\n` +
    `     - ${purchase2.purchaseCode} (${supplierBioFarma.name}): ${purchase2.details.length} item\n`
  );

  // =========================================================================
  // 6. TRANSACTIONS (transaksi penjualan)
  // =========================================================================
  console.log('🧾 Seeding transactions...');

  // --- 6a. Transaksi OFFLINE (langsung selesai, oleh kasir) ---
  const offlineTrx = await prisma.transaction.create({
    data: {
      orderCode: `ORD-OFFLINE-${cuid()}`,
      type: 'OFFLINE',
      status: 'COMPLETED',
      totalPrice: 3 * 1500 + 2 * 5000,   // 3 Paracetamol + 2 Cetirizine
      cashierId: kasir.id,
      customerId: null,                   // pembeli langsung, tidak terdaftar
      usageInstructions:
        'Paracetamol: 3x sehari 1 tablet sesudah makan. Cetirizine: 1x sehari 1 tablet malam hari.',
      details: {
        create: [
          {
            drugId: paracetamol.id,
            quantity: 3,
            unitPrice: 1500,
            subtotal: 4500,
          },
          {
            drugId: cetirizine.id,
            quantity: 2,
            unitPrice: 5000,
            subtotal: 10000,
          },
        ],
      },
    },
    include: { details: true },
  });

  // --- 6b. Transaksi ONLINE (status COMPLETED sudah diverifikasi + selesai) ---
  const onlineTrxCompleted = await prisma.transaction.create({
    data: {
      orderCode: `ORD-ONLINE-${cuid()}`,
      type: 'ONLINE',
      status: 'COMPLETED',
      totalPrice: 10 * 3500 + 5 * 7000,  // 10 Amoxicillin + 5 Omeprazole
      cashierId: kasir.id,
      customerId: customer.id,
      paymentProofImageUrl: '/uploads/payment-proofs/sample-proof.jpg',
      prescriptionImageUrl: '/uploads/prescriptions/sample-resep.jpg',
      usageInstructions:
        'Amoxicillin: 3x sehari 1 kapsul hingga habis (5 hari). Omeprazole: 1x sehari 1 kapsul sebelum makan pagi.',
      details: {
        create: [
          {
            drugId: amoxicillin.id,
            quantity: 10,
            unitPrice: 3500,
            subtotal: 35000,
          },
          {
            drugId: omeprazole.id,
            quantity: 5,
            unitPrice: 7000,
            subtotal: 35000,
          },
        ],
      },
    },
    include: { details: true },
  });

  // --- 6c. Transaksi ONLINE (status PENDING — belum bayar) ---
  const onlineTrxPending = await prisma.transaction.create({
    data: {
      orderCode: `ORD-ONLINE-${cuid()}`,
      type: 'ONLINE',
      status: 'PENDING',
      totalPrice: 5 * 4000 + 1 * 25000,  // 5 Metformin + 1 Racikan
      cashierId: kasir.id,
      customerId: customer.id,
      usageInstructions: null,
      details: {
        create: [
          {
            drugId: metformin.id,
            quantity: 5,
            unitPrice: 4000,
            subtotal: 20000,
          },
          {
            customMedicineId: obatRacikan.id,
            quantity: 1,
            unitPrice: 25000,
            subtotal: 25000,
          },
        ],
      },
    },
    include: { details: true },
  });

  console.log(
    `  ✅ Transactions berhasil dibuat:\n` +
    `     - ${offlineTrx.orderCode} | OFFLINE | COMPLETED | ${offlineTrx.details.length} item\n` +
    `     - ${onlineTrxCompleted.orderCode} | ONLINE  | COMPLETED | ${onlineTrxCompleted.details.length} item\n` +
    `     - ${onlineTrxPending.orderCode} | ONLINE  | PENDING   | ${onlineTrxPending.details.length} item\n`
  );

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('━'.repeat(55));
  console.log('🎉 Seeding selesai! Ringkasan data yang dibuat:');
  console.log(`   Users              : 4`);
  console.log(`   Suppliers          : 3`);
  console.log(`   Drugs              : ${allDrugs.length}`);
  console.log(`   Custom Medicines   : 1`);
  console.log(`   Purchases          : 2 (total ${purchase1.details.length + purchase2.details.length} item)`);
  console.log(`   Transactions       : 3 (total ${offlineTrx.details.length + onlineTrxCompleted.details.length + onlineTrxPending.details.length} item)`);
  console.log('━'.repeat(55));
}

main()
  .catch((error) => {
    console.error('❌ Seed gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
