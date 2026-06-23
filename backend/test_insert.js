const { poolPromise, sql } = require('./db');

async function run() {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
            .input('thuocID', sql.Int, 1)
            .input('dieuKien', sql.NVarChar, "Test")
            .input('mucDo', sql.NVarChar, "Test")
            .input('heuQua', sql.NVarChar, "Test")
            .input('moTa', sql.NVarChar, "Test")
            .query(`
                INSERT INTO ChongChiDinh (thuocID, dieuKien, mucDo, heuQua, moTa)
                OUTPUT INSERTED.ruleID AS id
                VALUES (@thuocID, @dieuKien, @mucDo, @heuQua, @moTa)
            `);
    console.log(result.recordset);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
