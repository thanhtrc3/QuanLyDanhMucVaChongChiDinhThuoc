const { poolPromise } = require('./db');

async function run() {
  try {
    const pool = await poolPromise;
    const result1 = await pool.request().query("SELECT name, is_identity FROM sys.columns WHERE object_id = object_id('ChongChiDinh')");
    console.log("ChongChiDinh:", result1.recordset);
    const result2 = await pool.request().query("SELECT name, is_identity FROM sys.columns WHERE object_id = object_id('TuongTacThuoc')");
    console.log("TuongTacThuoc:", result2.recordset);
    
    const d1 = await pool.request().query("SELECT COUNT(*) as c FROM ChongChiDinh");
    console.log("ChongChiDinh count:", d1.recordset);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
