require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function setupDB() {
  try {
    const pool = await poolPromise;
    console.log('Connected to SQL Server. Creating SystemSettings table...');
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SystemSettings' and xtype='U')
      BEGIN
        CREATE TABLE SystemSettings (
          settingKey VARCHAR(50) PRIMARY KEY,
          settingValue NVARCHAR(MAX) NOT NULL,
          description NVARCHAR(255) NULL,
          updatedAt DATETIME DEFAULT GETDATE(),
          updatedBy INT NULL FOREIGN KEY REFERENCES NguoiDung(userId)
        );
        
        -- Insert default thresholds
        INSERT INTO SystemSettings (settingKey, settingValue, description)
        VALUES ('nearExpiryDays', '30', N'Số ngày trước khi thuốc được coi là sắp hết hạn');
      END
    `);
    
    console.log('SystemSettings table created or already exists.');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDB();
