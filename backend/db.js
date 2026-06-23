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

    try {
      const bcrypt = require('bcryptjs');

      // Admin
      const checkAdmin = await pool.request().query("SELECT * FROM NguoiDung WHERE tenDangNhap = 'admin'");
      if (checkAdmin.recordset.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const matKhauHash = await bcrypt.hash('123456', salt);
        await pool.request()
          .input('tenDangNhap', sql.VarChar(50), 'admin')
          .input('matKhauHash', sql.VarChar(255), matKhauHash)
          .input('hoTen', sql.NVarChar(100), 'Quản trị viên hệ thống')
          .input('vaiTro', sql.NVarChar(50), 'Admin')
          .input('trangThai', sql.Int, 1)
          .query(`
            INSERT INTO NguoiDung (tenDangNhap, matKhauHash, hoTen, vaiTro, trangThai)
            VALUES (@tenDangNhap, @matKhauHash, @hoTen, @vaiTro, @trangThai)
          `);
        console.log('Default admin account (admin/123456) created successfully.');
      }

      // Bác sĩ
      const checkBacSi = await pool.request().query("SELECT * FROM NguoiDung WHERE tenDangNhap = 'bacsi'");
      if (checkBacSi.recordset.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const matKhauHash = await bcrypt.hash('123456', salt);
        await pool.request()
          .input('tenDangNhap', sql.VarChar(50), 'bacsi')
          .input('matKhauHash', sql.VarChar(255), matKhauHash)
          .input('hoTen', sql.NVarChar(100), 'Bác sĩ mặc định')
          .input('vaiTro', sql.NVarChar(50), 'BacSi')
          .input('trangThai', sql.Int, 1)
          .query(`
            INSERT INTO NguoiDung (tenDangNhap, matKhauHash, hoTen, vaiTro, trangThai)
            VALUES (@tenDangNhap, @matKhauHash, @hoTen, @vaiTro, @trangThai)
          `);
        console.log('Default doctor account (bacsi/123456) created successfully.');
      }

      // Dược sĩ
      const checkDuocSi = await pool.request().query("SELECT * FROM NguoiDung WHERE tenDangNhap = 'duocsi'");
      if (checkDuocSi.recordset.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const matKhauHash = await bcrypt.hash('123456', salt);
        await pool.request()
          .input('tenDangNhap', sql.VarChar(50), 'duocsi')
          .input('matKhauHash', sql.VarChar(255), matKhauHash)
          .input('hoTen', sql.NVarChar(100), 'Dược sĩ mặc định')
          .input('vaiTro', sql.NVarChar(50), 'DuocSi')
          .input('trangThai', sql.Int, 1)
          .query(`
            INSERT INTO NguoiDung (tenDangNhap, matKhauHash, hoTen, vaiTro, trangThai)
            VALUES (@tenDangNhap, @matKhauHash, @hoTen, @vaiTro, @trangThai)
          `);
        console.log('Default pharmacist account (duocsi/123456) created successfully.');
      }
    } catch (error) {
      console.error('Could not ensure default accounts:', error);
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
