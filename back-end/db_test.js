const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:123456@localhost:5432/apotek_pemuda' });

async function run() {
  await client.connect();
  const res = await client.query('SELECT id, type, "createdAt" FROM transactions ORDER BY id DESC LIMIT 10');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
