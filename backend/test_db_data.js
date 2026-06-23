const { poolPromise } = require('./db');

async function run() {
  try {
    const pool = await poolPromise;
    const r1 = await pool.request().query("SELECT * FROM ChongChiDinh");
    console.log("ChongChiDinh:", r1.recordset);
    const r2 = await pool.request().query("SELECT * FROM TuongTacThuoc");
    console.log("TuongTacThuoc:", r2.recordset);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
