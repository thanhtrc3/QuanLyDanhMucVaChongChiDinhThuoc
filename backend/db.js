const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');

dotenv.config();

// Cấu hình kết nối SQL Server sử dụng Windows Authentication
const config = {
  driver: 'ODBC Driver 17 for SQL Server',
  server: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'QuanLyThuoc_ChongChiDinh',
  options: {
    trustedConnection: true, // Kích hoạt Windows Authentication
    trustServerCertificate: true // Bỏ qua lỗi SSL
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server thành công!');
    return pool;
  })
  .catch(err => console.log('❌ Database Connection Failed! Lỗi: ', err));

module.exports = {
  sql, poolPromise
};
