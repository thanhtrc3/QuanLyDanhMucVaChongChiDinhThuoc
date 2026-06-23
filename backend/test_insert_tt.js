const { poolPromise, sql } = require('./db');

async function run() {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
            .input('thuocID_1', sql.Int, 1)
            .input('thuocID_2', sql.Int, 2)
            .input('mucDo', sql.NVarChar, "Trung binh")
            .input('coCheTacDung', sql.NVarChar, "Test")
            .input('khuyenCao', sql.NVarChar, "Test")
            .query(`
                INSERT INTO TuongTacThuoc (thuocID_1, thuocID_2, mucDo, coCheTacDung, khuyenCao)
                OUTPUT INSERTED.tuongTacID AS id
                VALUES (@thuocID_1, @thuocID_2, @mucDo, @coCheTacDung, @khuyenCao)
            `);
    console.log(result.recordset);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
