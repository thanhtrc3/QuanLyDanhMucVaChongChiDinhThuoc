let sql;

try {
  sql = require('mssql/msnodesqlv8');
} catch (_error) {
  sql = require('mssql');
}

const dotenv = require('dotenv');

dotenv.config();

const config = {
  driver: 'ODBC Driver 17 for SQL Server',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'QuanLyThuoc_ChongChiDinh',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(async (pool) => {
    console.log('Connected to SQL Server');

    try {
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Thuoc' AND COLUMN_NAME = 'trangThai'
        )
        BEGIN
          ALTER TABLE Thuoc ADD trangThai INT DEFAULT 1;
          EXEC('UPDATE Thuoc SET trangThai = 1 WHERE trangThai IS NULL');
        END
      `);
    } catch (error) {
      console.error('Could not ensure Thuoc.trangThai column:', error);
    }

    return pool;
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    throw error;
  });

module.exports = {
  sql,
  poolPromise
};
