require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      email: "admin@apotek.local",
      password: "123456",
      role: "ADMIN"
    },
    create: {
      username: "admin",
      email: "admin@apotek.local",
      password: "123456",
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { username: "kasir" },
    update: {
      email: "kasir@apotek.local",
      password: "123456",
      role: "KASIR"
    },
    create: {
      username: "kasir",
      email: "kasir@apotek.local",
      password: "123456",
      role: "KASIR"
    }
  });

  await prisma.user.upsert({
    where: { username: "customer" },
    update: {
      email: "customer@apotek.local",
      password: "123456",
      role: "CUSTOMER",
      isMember: true
    },
    create: {
      username: "customer",
      email: "customer@apotek.local",
      password: "123456",
      role: "CUSTOMER",
      isMember: true
    }
  });

  console.log("✅ Seed berhasil masuk!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });