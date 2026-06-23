require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function setupDB() {
  try {
    const pool = await poolPromise;
    console.log('Connected to SQL Server. Creating AccountRequests table...');
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AccountRequests' and xtype='U')
      CREATE TABLE AccountRequests (
        requestID INT PRIMARY KEY IDENTITY(1,1),
        tenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
        hoTen NVARCHAR(100) NOT NULL,
        emailOrPhone NVARCHAR(100) NOT NULL,
        vaiTro NVARCHAR(50) NOT NULL,
        lyDo NVARCHAR(255),
        trangThai NVARCHAR(50) DEFAULT 'ChoDuyet', -- ChoDuyet, DaDuyet, TuChoi
        ngayYeuCau DATETIME DEFAULT GETDATE(),
        ngayXuLy DATETIME NULL,
        nguoiXuLyID INT NULL FOREIGN KEY REFERENCES NguoiDung(userId)
      );
    `);
    
    console.log('AccountRequests table created or already exists.');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDB();
