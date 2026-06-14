require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SEED_USERS = [
  {
    username: 'admin',
    email: 'admin@apotek.local',
    password: '123456',
    role: 'ADMIN',
    isMember: false,
    membershipStatus: null,
  },
  {
    username: 'kasir',
    email: 'kasir@apotek.local',
    password: '123456',
    role: 'KASIR',
    isMember: false,
    membershipStatus: null,
  },
  {
    username: 'customer',
    email: 'customer@apotek.local',
    password: '123456',
    role: 'CUSTOMER',
    isMember: true,
    membershipStatus: 'active',
  },
  {
    username: 'owner',
    email: 'owner@apotek.local',
    password: '123456',
    role: 'OWNER',
    isMember: false,
    membershipStatus: null,
  },
];

const resolveUserTable = async () => {
  const tableCheck = await pool.query(
    `SELECT
       to_regclass('public."User"') AS "userTable",
       to_regclass('public.users') AS "usersTable"`
  );

  if (tableCheck.rows[0]?.userTable) {
    return '"User"';
  }

  if (tableCheck.rows[0]?.usersTable) {
    return 'users';
  }

  throw new Error('Tabel user tidak ditemukan ("User" atau users).');
};

async function main() {
  const userTable = await resolveUserTable();

  for (const user of SEED_USERS) {
    await pool.query(
      `INSERT INTO ${userTable} ("username", "email", "password", "role", "isMember", "membershipStatus", "updatedAt")
       VALUES ($1, $2, $3, $4::"Role", $5, $6, NOW())
       ON CONFLICT ("username")
       DO UPDATE SET
         "email" = EXCLUDED."email",
         "password" = EXCLUDED."password",
         "role" = EXCLUDED."role",
         "isMember" = EXCLUDED."isMember",
         "membershipStatus" = EXCLUDED."membershipStatus",
         "updatedAt" = NOW()`,
      [user.username, user.email, user.password, user.role, user.isMember, user.membershipStatus]
    );
  }

  console.log('✅ Seed user berhasil masuk ke tabel', userTable);

  console.log('⏳ Menghapus data supplier lama...');
  try {
    await pool.query(`TRUNCATE TABLE "suppliers" RESTART IDENTITY CASCADE`);
    console.log('⏳ Memasukkan data supplier baru...');
    const suppliers = [
      { name: 'PT Kalbe Farma', contactPerson: 'Budi', phone: '081234567890', address: 'Jakarta' },
      { name: 'PT Sanbe Farma', contactPerson: 'Andi', phone: '081298765432', address: 'Bandung' },
      { name: 'PT Dexa Medica', contactPerson: 'Cici', phone: '081211223344', address: 'Tangerang' }
    ];
    for (const sup of suppliers) {
      await pool.query(
        `INSERT INTO "suppliers" ("name", "contactPerson", "phone", "address", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [sup.name, sup.contactPerson, sup.phone, sup.address]
      );
    }
    console.log('✅ Seed data supplier berhasil.');
  } catch (err) {
    console.error('❌ Gagal seed data supplier:', err);
  }

  console.log('⏳ Menghapus data obat lama dan mereset tabel...');
  try {
    await pool.query(`TRUNCATE TABLE "drugs" RESTART IDENTITY CASCADE`);
    console.log('⏳ Memasukkan data obat baru...');
    
    // Ambil supplier untuk diacak
    const supResult = await pool.query(`SELECT id FROM "suppliers"`);
    const supplierIds = supResult.rows.map(r => r.id);

    const drugsData = [
      ['Meloxicam 15 mg', 'Data opname produk Meloxicam 15 mg dengan satuan Stp.', 'KERAS', 43, 'Stp', 6090.00, 7003.50],
      ['Methylprednisolone 4mg', 'Data opname produk Methylprednisolone 4mg dengan satuan Stp.', 'KERAS', 49, 'Stp', 4350.00, 5002.50],
      ['Methylprednisolone 8mg', 'Data opname produk Methylprednisolone 8mg dengan satuan Stp.', 'KERAS', 18, 'Stp', 6090.00, 7003.50],
      ['Methylprednisolone 16mg', 'Data opname produk Methylprednisolone 16mg dengan satuan Stp.', 'KERAS', 16, 'Stp', 10440.00, 12006.00],
      ['Nifedipine 10mg', 'Data opname produk Nifedipine 10mg dengan satuan Stp.', 'KERAS', 29, 'Stp', 2610.00, 3001.50],
      ['Piroxicam 10mg', 'Data opname produk Piroxicam 10mg dengan satuan Stp.', 'KERAS', 22, 'Stp', 1987.00, 2285.05],
      ['Piroxicam 20mg', 'Data opname produk Piroxicam 20mg dengan satuan Stp.', 'KERAS', 162, 'Stp', 2610.00, 3001.50],
      ['Propranolol 10mg', 'Data opname produk Propranolol 10mg dengan satuan Stp.', 'KERAS', 42, 'Stp', 2610.00, 3001.50],
      ['Pyrazinamide 500mg', 'Data opname produk Pyrazinamide 500mg dengan satuan Stp.', 'KERAS', 7, 'Stp', 3180.00, 3657.00],
      ['Propylthiouracil 100mg', 'Data opname produk Propylthiouracil 100mg dengan satuan Stp.', 'KERAS', 5, 'Stp', 6960.00, 8004.00],
      ['Spironolactone 100mg', 'Data opname produk Spironolactone 100mg dengan satuan Stp.', 'KERAS', 20, 'Stp', 11310.00, 13006.50],
      ['Simvastatin 10mg', 'Data opname produk Simvastatin 10mg dengan satuan Stp.', 'KERAS', 38, 'Stp', 4350.00, 5002.50],
      ['Simvastatin 20mg', 'Data opname produk Simvastatin 20mg dengan satuan Stp.', 'KERAS', 9, 'Stp', 8700.00, 10005.00],
      ['Salbutamol 2mg', 'Data opname produk Salbutamol 2mg dengan satuan Stp.', 'KERAS', 45, 'Stp', 2610.00, 3001.50],
      ['Salbutamol 4mg', 'Data opname produk Salbutamol 4mg dengan satuan Stp.', 'KERAS', 17, 'Stp', 2610.00, 3001.50],
      ['Omeprazole', 'Data opname produk Omeprazole dengan satuan Stp.', 'KERAS', 61, 'Stp', 5220.00, 6003.00],
      ['Ondansetron 4mg', 'Data opname produk Ondansetron 4mg dengan satuan Stp.', 'KERAS', 5, 'Stp', 4350.00, 5002.50],
      ['Ondansetron 8mg', 'Data opname produk Ondansetron 8mg dengan satuan Stp.', 'KERAS', 13, 'Stp', 20010.00, 23011.50],
      ['Rifampicin 450mg', 'Data opname produk Rifampicin 450mg dengan satuan Stp.', 'KERAS', 17, 'Stp', 18270.00, 21010.50],
      ['Piracetam 400mg', 'Data opname produk Piracetam 400mg dengan satuan Stp.', 'KERAS', 0, 'Stp', 4350.00, 5002.50],
      ['Ranitidine', 'Data opname produk Ranitidine dengan satuan Stp.', 'KERAS', 32, 'Stp', 2610.00, 3001.50],
      ['Diabetasol Vanilla 180gr', 'Data opname produk Diabetasol Vanilla 180gr dengan satuan Box.', 'BEBAS', 3, 'Box', 45230.00, 52014.50],
      ['Sari Kurma Sahara Original', 'Data opname produk Sari Kurma Sahara Original dengan satuan Fls.', 'BEBAS', 6, 'Fls', 20010.00, 23011.50],
      ['Cotrimoxazole', 'Data opname produk Cotrimoxazole dengan satuan Stp.', 'KERAS', 4, 'Stp', 2610.00, 3001.50],
      ['Digoxin', 'Data opname produk Digoxin dengan satuan Stp.', 'KERAS', 30, 'Stp', 2610.00, 3001.50],
      ['Doxycycline 100mg', 'Data opname produk Doxycycline 100mg dengan satuan Stp.', 'KERAS', 9, 'Stp', 8700.00, 10005.00],
      ['Domperidone', 'Data opname produk Domperidone dengan satuan Stp.', 'KERAS', 20, 'Stp', 4350.00, 5002.50],
      ['Diclofenac Sodium', 'Data opname produk Diclofenac Sodium dengan satuan Stp.', 'KERAS', 36, 'Stp', 4350.00, 5002.50],
      ['Furosemide', 'Data opname produk Furosemide dengan satuan Stp.', 'KERAS', 19, 'Stp', 2610.00, 3001.50],
      ['Glimepiride 1mg', 'Data opname produk Glimepiride 1mg dengan satuan Stp.', 'KERAS', 17, 'Stp', 6960.00, 8004.00],
      ['Glimepiride 2mg', 'Data opname produk Glimepiride 2mg dengan satuan Stp.', 'KERAS', 15, 'Stp', 8700.00, 10005.00],
      ['Glimepiride 3mg', 'Data opname produk Glimepiride 3mg dengan satuan Stp.', 'KERAS', 21, 'Stp', 13050.00, 15007.50],
      ['Glimepiride 4mg', 'Data opname produk Glimepiride 4mg dengan satuan Stp.', 'KERAS', 62, 'Stp', 16530.00, 19009.50],
      ['Glibenclamide', 'Data opname produk Glibenclamide dengan satuan Stp.', 'KERAS', 19, 'Stp', 2610.00, 3001.50],
      ['Ibuprofen 400mg', 'Data opname produk Ibuprofen 400mg dengan satuan Stp.', 'BEBAS_TERBATAS', 40, 'Stp', 3045.00, 3501.75],
      ['Ketoconazole 200mg', 'Data opname produk Ketoconazole 200mg dengan satuan Stp.', 'KERAS', 22, 'Stp', 5220.00, 6003.00],
      ['Lansoprazole', 'Data opname produk Lansoprazole dengan satuan Stp.', 'KERAS', 62, 'Stp', 11310.00, 13006.50],
      ['Levofloxacin 500mg', 'Data opname produk Levofloxacin 500mg dengan satuan Stp.', 'KERAS', 16, 'Stp', 9135.00, 10505.25],
      ['Metronidazole 500 mg', 'Data opname produk Metronidazole 500 mg dengan satuan Stp.', 'KERAS', 15, 'Stp', 4350.00, 5002.50],
      ['Metformin 500 mg', 'Data opname produk Metformin 500 mg dengan satuan Stp.', 'KERAS', 43, 'Stp', 2610.00, 3001.50],
      ['Diabetasol Gula isi 25', 'Data opname produk Diabetasol Gula isi 25 dengan satuan Box.', 'BEBAS', 3, 'Box', 20010.00, 23011.50],
      ['Tropicana Slim isi 50', 'Data opname produk Tropicana Slim isi 50 dengan satuan Box.', 'BEBAS', 3, 'Box', 41760.00, 48024.00],
      ['Biolysin Multivitamin', 'Data opname produk Biolysin Multivitamin dengan satuan Fls.', 'BEBAS', 5, 'Fls', 13050.00, 15007.50],
      ['Cerebrofort Gold', 'Data opname produk Cerebrofort Gold dengan satuan Fls.', 'BEBAS', 6, 'Fls', 18270.00, 21010.50],
      ['Sanmol Sirup', 'Data opname produk Sanmol Sirup dengan satuan Fls.', 'BEBAS', 21, 'Fls', 17400.00, 20010.00],
      ['Stimuno Original 60ml', 'Data opname produk Stimuno Original 60ml dengan satuan Fls.', 'BEBAS', 6, 'Fls', 26100.00, 30015.00]
    ];

    let valueStrings = [];
    let queryParams = [];
    let paramIndex = 1;

    for (const d of drugsData) {
      const supplierId = supplierIds.length > 0 ? supplierIds[Math.floor(Math.random() * supplierIds.length)] : null;
      // Random expired date in 2025-2027
      const year = 2025 + Math.floor(Math.random() * 3);
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const expiredDate = `${year}-${month}-01`;

      valueStrings.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6}, $${paramIndex+7}, $${paramIndex+8}, NOW(), NOW())`);
      queryParams.push(d[0], d[1], d[2], d[3], d[4], d[5], d[6], supplierId, expiredDate);
      paramIndex += 9;
    }

    const insertQuery = `
      INSERT INTO "drugs" ("name", "description", "category", "stock", "unit", "purchasePrice", "price", "supplierId", "expiredDate", "createdAt", "updatedAt") 
      VALUES ${valueStrings.join(', ')}
    `;
    await pool.query(insertQuery, queryParams);
    console.log('✅ Seed data obat baru berhasil masuk ke tabel "drugs".');
  } catch (err) {
    console.error('❌ Gagal seed data obat:', err);
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed gagal:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });