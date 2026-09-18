import mysql from 'mysql2/promise';
import fs from 'fs';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA),
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const verifyDatabaseConnection = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};

export const ensureSocialAuthColumns = async () => {
  const [columns] = await pool.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME IN ('social_provider', 'social_provider_id')`
  );
  const existingColumns = new Set(columns.map(({ COLUMN_NAME: name }) => name));

  if (!existingColumns.has('social_provider')) {
    await pool.execute(
      'ALTER TABLE users ADD COLUMN social_provider VARCHAR(20) NULL'
    );
  }

  if (!existingColumns.has('social_provider_id')) {
    await pool.execute(
      'ALTER TABLE users ADD COLUMN social_provider_id VARCHAR(255) NULL'
    );
  }

  const [indexes] = await pool.execute(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND INDEX_NAME = 'uq_users_social_identity'`
  );

  if (!indexes.length) {
    await pool.execute(
      'ALTER TABLE users ADD UNIQUE KEY uq_users_social_identity (social_provider, social_provider_id)'
    );
  }
};

export default pool;
