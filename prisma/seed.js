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
}

main()
  .catch((error) => {
    console.error('❌ Seed gagal:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });