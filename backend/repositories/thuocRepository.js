const { poolPromise, sql } = require('../db');

function mapThuoc(row) {
  return {
    id: row.thuocID,
    tenThuong: row.tenThuongMai,
    maATC: row.maATC,
    hoatChat: row.hoatChat,
    nhomThuoc: row.tenNhom || 'Khác',
    nhomThuocID: row.nhomThuocID,
    doiTuong: row.doiTuong || 'Tất cả',
    donVi: row.donViTinh || '',
    giaBan: row.giaBan || 0,
    tonKho: row.tonKhoHienTai,
    tonKhoToiThieu: row.tonToiThieu,
    hanDung: row.ngayHetHan ? row.ngayHetHan.toISOString().split('T')[0] : '',
    moTa: row.moTa || '',
    trangThai: row.trangThai === 'Hoạt động'
  };
}

async function findAll({ keyword } = {}) {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `
    SELECT t.*, n.tenNhom 
    FROM Thuoc t
    LEFT JOIN NhomThuoc n ON t.nhomThuocID = n.nhomThuocID
    ORDER BY t.tenThuongMai ASC
  `;

  if (keyword) {
    request.input('keyword', sql.NVarChar(150), `%${keyword}%`);
    query = `
      SELECT t.*, n.tenNhom
      FROM Thuoc t
      LEFT JOIN NhomThuoc n ON t.nhomThuocID = n.nhomThuocID
      WHERE t.tenThuongMai LIKE @keyword
         OR t.maATC LIKE @keyword
         OR t.hoatChat LIKE @keyword
      ORDER BY t.tenThuongMai ASC
    `;
  }

  const result = await request.query(query);
  return result.recordset.map(mapThuoc);
}

async function findById(thuocID) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('thuocID', sql.Int, thuocID)
    .query(`
      SELECT t.*, n.tenNhom 
      FROM Thuoc t
      LEFT JOIN NhomThuoc n ON t.nhomThuocID = n.nhomThuocID
      WHERE t.thuocID = @thuocID
    `);

  return result.recordset[0] ? mapThuoc(result.recordset[0]) : null;
}

async function findSuggestions({ keyword, limit = 8 }) {
  const pool = await poolPromise;
  const request = pool.request()
    .input('keyword', sql.NVarChar(150), `%${keyword}%`)
    .input('startsWith', sql.NVarChar(150), `${keyword}%`)
    .input('limit', sql.Int, limit);

  const result = await request.query(`
    SELECT TOP (@limit) t.*, n.tenNhom
    FROM Thuoc t
    LEFT JOIN NhomThuoc n ON t.nhomThuocID = n.nhomThuocID
    WHERE @keyword = '%%'
       OR t.maATC LIKE @keyword
       OR t.tenThuongMai LIKE @keyword
       OR t.hoatChat LIKE @keyword
    ORDER BY CASE WHEN t.maATC LIKE @startsWith OR t.tenThuongMai LIKE @startsWith THEN 0 ELSE 1 END,
             t.tenThuongMai
  `);

  return result.recordset.map(mapThuoc);
}

async function createThuoc(data) {
  const pool = await poolPromise;
  
  // Resolve nhomThuocID from tenNhom if available, or just use ID if passed
  // In our case, the frontend will pass 'nhomThuoc' string or 'nhomThuocID'
  
  const result = await pool.request()
    .input('maATC', sql.VarChar(20), data.maATC)
    .input('tenThuongMai', sql.NVarChar(150), data.tenThuong)
    .input('hoatChat', sql.NVarChar(150), data.hoatChat)
    .input('donViTinh', sql.NVarChar(20), data.donVi)
    .input('giaBan', sql.Decimal(18,2), data.giaBan || 0)
    .input('doiTuong', sql.NVarChar(50), data.doiTuong || 'Tất cả')
    .input('moTa', sql.NVarChar(500), data.moTa || '')
    .input('tonKhoHienTai', sql.Int, data.tonKho)
    .input('tonToiThieu', sql.Int, data.tonKhoToiThieu)
    .input('ngayHetHan', sql.Date, data.hanDung)
    .input('trangThai', sql.NVarChar(50), data.trangThai ? 'Hoạt động' : 'Ngừng kinh doanh')
    .input('tenNhom', sql.NVarChar(120), data.nhomThuoc)
    .query(`
      DECLARE @resolvedNhomID INT = NULL;
      IF @tenNhom IS NOT NULL
      BEGIN
         SELECT @resolvedNhomID = nhomThuocID FROM NhomThuoc WHERE tenNhom = @tenNhom;
         -- Tự tạo nhóm mới nếu chưa có
         IF @resolvedNhomID IS NULL
         BEGIN
            INSERT INTO NhomThuoc (tenNhom, trangThai) VALUES (@tenNhom, 1);
            SET @resolvedNhomID = SCOPE_IDENTITY();
         END
      END

      INSERT INTO Thuoc (
        maATC, tenThuongMai, hoatChat, nhomThuocID, donViTinh,
        giaBan, doiTuong, moTa,
        tonKhoHienTai, tonToiThieu, ngayHetHan, trangThai
      )
      VALUES (
        @maATC, @tenThuongMai, @hoatChat, @resolvedNhomID, @donViTinh,
        @giaBan, @doiTuong, @moTa,
        @tonKhoHienTai, @tonToiThieu, @ngayHetHan, @trangThai
      );
      SELECT SCOPE_IDENTITY() AS thuocID;
    `);

  const inserted = result.recordset[0];
  return findById(inserted.thuocID);
}

async function updateThuoc(thuocID, data) {
  const pool = await poolPromise;
  
  const result = await pool.request()
    .input('thuocID', sql.Int, thuocID)
    .input('maATC', sql.VarChar(20), data.maATC)
    .input('tenThuongMai', sql.NVarChar(150), data.tenThuong)
    .input('hoatChat', sql.NVarChar(150), data.hoatChat)
    .input('donViTinh', sql.NVarChar(20), data.donVi)
    .input('giaBan', sql.Decimal(18,2), data.giaBan || 0)
    .input('doiTuong', sql.NVarChar(50), data.doiTuong || 'Tất cả')
    .input('moTa', sql.NVarChar(500), data.moTa || '')
    .input('tonKhoHienTai', sql.Int, data.tonKho)
    .input('tonToiThieu', sql.Int, data.tonKhoToiThieu)
    .input('ngayHetHan', sql.Date, data.hanDung)
    .input('trangThai', sql.NVarChar(50), data.trangThai ? 'Hoạt động' : 'Ngừng kinh doanh')
    .input('tenNhom', sql.NVarChar(120), data.nhomThuoc)
    .query(`
      DECLARE @resolvedNhomID INT = NULL;
      IF @tenNhom IS NOT NULL
      BEGIN
         SELECT @resolvedNhomID = nhomThuocID FROM NhomThuoc WHERE tenNhom = @tenNhom;
         IF @resolvedNhomID IS NULL
         BEGIN
            INSERT INTO NhomThuoc (tenNhom, trangThai) VALUES (@tenNhom, 1);
            SET @resolvedNhomID = SCOPE_IDENTITY();
         END
      END

      UPDATE Thuoc
      SET maATC = @maATC,
          tenThuongMai = @tenThuongMai,
          hoatChat = @hoatChat,
          nhomThuocID = @resolvedNhomID,
          donViTinh = @donViTinh,
          giaBan = @giaBan,
          doiTuong = @doiTuong,
          moTa = @moTa,
          tonKhoHienTai = @tonKhoHienTai,
          tonToiThieu = @tonToiThieu,
          ngayHetHan = @ngayHetHan,
          trangThai = @trangThai
      WHERE thuocID = @thuocID
    `);

  return findById(thuocID);
}

async function removeThuoc(thuocID) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('thuocID', sql.Int, thuocID)
    .query('DELETE FROM Thuoc WHERE thuocID = @thuocID');

  return result.rowsAffected[0] > 0;
}

module.exports = {
  findAll,
  findById,
  findSuggestions,
  createThuoc,
  updateThuoc,
  removeThuoc
};
