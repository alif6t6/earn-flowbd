import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query("UPDATE users SET is_admin = true WHERE username = 'alif6t6'");
  console.log('Made alif6t6 admin');
  process.exit(0);
}
run();
