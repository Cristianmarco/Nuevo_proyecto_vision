const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.mxaoodjkfbxpuzvtgzcb:UsXsKHRYc9P5FPPp@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const res = await pool.query('SELECT NOW() as fecha');
    console.log("¡Conexión exitosa! Fecha actual en DB:", res.rows[0].fecha);
    process.exit(0);
  } catch (err) {
    console.error("ERROR DE CONEXIÓN:", err);
    process.exit(1);
  }
})();
