const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Cadu1207",
  database: process.env.DB_NAME || "financesystem",
});

module.exports = pool;
pool.connect()
  .then(() => console.log("PostgreSQL conectado!"))
  .catch((err) => console.error("Erro na conexão:", err.message));