const { poolPromise, sql } = require('./db');
const bcrypt = require('bcryptjs');

async function testApprove() {
  try {
    const pool = await poolPromise;
    const reqs = await pool.request().query("SELECT * FROM AccountRequests WHERE trangThai='ChoDuyet'");
    if (reqs.recordset.length === 0) {
        console.log('No pending requests');
        process.exit(0);
    }
    const accountReq = reqs.recordset[0];
    const id = accountReq.requestID;
    const adminId = 1;

    console.log('Processing request:', accountReq);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const userReq = new sql.Request(transaction);
      await userReq
        .input('tenDangNhap', sql.VarChar(50), accountReq.tenDangNhap)
        .input('matKhauHash', sql.VarChar(255), hashedPassword)
        .input('hoTen', sql.NVarChar(100), accountReq.hoTen)
        .input('vaiTro', sql.NVarChar(50), accountReq.vaiTro)
        .query(`
          INSERT INTO NguoiDung (tenDangNhap, matKhauHash, hoTen, vaiTro)
          VALUES (@tenDangNhap, @matKhauHash, @hoTen, @vaiTro)
        `);
        
      const updateReq = new sql.Request(transaction);
      await updateReq
        .input('id', sql.Int, id)
        .input('adminId', sql.Int, adminId)
        .query(`
          UPDATE AccountRequests 
          SET trangThai = 'DaDuyet', ngayXuLy = GETDATE(), nguoiXuLyID = @adminId
          WHERE requestID = @id
        `);
        
      await transaction.commit();
      console.log('Success');
      process.exit(0);
    } catch (txErr) {
      await transaction.rollback();
      console.error('Transaction Error:', txErr);
      process.exit(1);
    }
  } catch (error) {
    console.error('Outer Error:', error);
    process.exit(1);
  }
}

testApprove();
