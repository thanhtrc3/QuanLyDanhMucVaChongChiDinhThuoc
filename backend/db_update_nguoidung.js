require('dotenv').config();
const { poolPromise } = require('./db');

async function updateDB() {
  try {
    const pool = await poolPromise;
    console.log('Checking and adding email column to NguoiDung table...');
    
    await pool.request().query(`
      IF COL_LENGTH('NguoiDung', 'email') IS NULL
      BEGIN
        ALTER TABLE NguoiDung
        ADD email NVARCHAR(100) NULL;
      END
    `);
    
    console.log('NguoiDung table updated.');
    process.exit(0);
  } catch (error) {
    console.error('Database update failed:', error);
    process.exit(1);
  }
}

updateDB();
