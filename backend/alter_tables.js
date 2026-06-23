const { poolPromise } = require('./db');

async function run() {
  try {
    const pool = await poolPromise;
    // ChongChiDinh
    console.log("Altering ChongChiDinh...");
    await pool.request().query('DELETE FROM ChongChiDinh');
    // Drop old columns (ignore if they don't exist)
    try { await pool.request().query('ALTER TABLE ChongChiDinh DROP COLUMN loaiDoiTuong'); } catch(e){}
    try { await pool.request().query('ALTER TABLE ChongChiDinh DROP COLUMN toanTu'); } catch(e){}
    try { await pool.request().query('ALTER TABLE ChongChiDinh DROP COLUMN giaTriSoSanh'); } catch(e){}
    try { await pool.request().query('ALTER TABLE ChongChiDinh DROP COLUMN moTaHauQua'); } catch(e){}
    
    // Add new columns
    try { await pool.request().query('ALTER TABLE ChongChiDinh ADD dieuKien NVARCHAR(MAX)'); } catch(e){}
    try { await pool.request().query('ALTER TABLE ChongChiDinh ADD heuQua NVARCHAR(MAX)'); } catch(e){}
    try { await pool.request().query('ALTER TABLE ChongChiDinh ADD moTa NVARCHAR(MAX)'); } catch(e){}

    // TuongTacThuoc
    console.log("Altering TuongTacThuoc...");
    await pool.request().query('DELETE FROM TuongTacThuoc');
    try { await pool.request().query('ALTER TABLE TuongTacThuoc DROP COLUMN maATC_1'); } catch(e){}
    try { await pool.request().query('ALTER TABLE TuongTacThuoc DROP COLUMN maATC_2'); } catch(e){}
    try { await pool.request().query('ALTER TABLE TuongTacThuoc DROP COLUMN huongXuTri'); } catch(e){}

    try { await pool.request().query('ALTER TABLE TuongTacThuoc ADD thuocID_1 INT'); } catch(e){}
    try { await pool.request().query('ALTER TABLE TuongTacThuoc ADD thuocID_2 INT'); } catch(e){}
    try { await pool.request().query('ALTER TABLE TuongTacThuoc ADD khuyenCao NVARCHAR(MAX)'); } catch(e){}
    
    // Add Foreign Keys for thuocID_1 and thuocID_2 if possible
    try { await pool.request().query('ALTER TABLE TuongTacThuoc ADD FOREIGN KEY (thuocID_1) REFERENCES Thuoc(thuocID)'); } catch(e){}
    try { await pool.request().query('ALTER TABLE TuongTacThuoc ADD FOREIGN KEY (thuocID_2) REFERENCES Thuoc(thuocID)'); } catch(e){}

    console.log("Database schema updated successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
