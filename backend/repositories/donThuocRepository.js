const { poolPromise, sql } = require('../db');

async function findAll() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT d.*,
           COUNT(c.chiTietID) AS soLoaiThuoc
    FROM DonThuoc d
    LEFT JOIN ChiTietDonThuoc c ON c.donThuocID = d.donThuocID
    GROUP BY d.donThuocID, d.maDonThuoc, d.tenBenhNhan, d.ngayKeDon,
             d.ghiChu, d.trangThai, d.createdBy, d.createdAt, d.updatedAt
    ORDER BY d.createdAt DESC
  `);

  return result.recordset;
}

async function findById(donThuocID) {
  const pool = await poolPromise;
  const headerResult = await pool.request()
    .input('donThuocID', sql.Int, donThuocID)
    .query('SELECT * FROM DonThuoc WHERE donThuocID = @donThuocID');

  const header = headerResult.recordset[0];
  if (!header) return null;

  const detailResult = await pool.request()
    .input('donThuocID', sql.Int, donThuocID)
    .query(`
      SELECT c.*, t.maATC, t.tenThuongMai, t.hoatChat, t.hamLuong, t.donViTinh
      FROM ChiTietDonThuoc c
      INNER JOIN Thuoc t ON t.thuocID = c.thuocID
      WHERE c.donThuocID = @donThuocID
      ORDER BY c.chiTietID
    `);

  return { ...header, chiTiet: detailResult.recordset };
}

async function createDraft(data) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('maDonThuoc', sql.VarChar(30), data.maDonThuoc)
    .input('tenBenhNhan', sql.NVarChar(150), data.tenBenhNhan)
    .input('ngayKeDon', sql.Date, data.ngayKeDon)
    .input('ghiChu', sql.NVarChar(500), data.ghiChu)
    .input('createdBy', sql.NVarChar(120), data.createdBy)
    .query(`
      INSERT INTO DonThuoc (maDonThuoc, tenBenhNhan, ngayKeDon, ghiChu, trangThai, createdBy)
      OUTPUT INSERTED.*
      VALUES (@maDonThuoc, @tenBenhNhan, @ngayKeDon, @ghiChu, N'Nháp', @createdBy)
    `);

  return { ...result.recordset[0], chiTiet: [] };
}

async function createPrescription(data) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const headerResult = await new sql.Request(transaction)
      .input('maDonThuoc', sql.VarChar(30), data.maDonThuoc)
      .input('tenBenhNhan', sql.NVarChar(150), data.tenBenhNhan)
      .input('ngayKeDon', sql.Date, data.ngayKeDon)
      .input('ghiChu', sql.NVarChar(500), data.ghiChu)
      .input('createdBy', sql.NVarChar(120), data.createdBy)
      .query(`
        INSERT INTO DonThuoc (maDonThuoc, tenBenhNhan, ngayKeDon, ghiChu, trangThai, createdBy)
        OUTPUT INSERTED.*
        VALUES (@maDonThuoc, @tenBenhNhan, @ngayKeDon, @ghiChu, N'Đã lưu', @createdBy)
      `);

    const header = headerResult.recordset[0];
    for (const item of data.chiTiet) {
      // BƯỚC 1: Kiểm tra tồn kho (Bug 1)
      const stockCheck = await new sql.Request(transaction)
        .input('thuocID', sql.Int, item.thuocID)
        .query('SELECT tenThuongMai, tonKhoHienTai FROM Thuoc WHERE thuocID = @thuocID');
      
      const thuocInfo = stockCheck.recordset[0];
      if (!thuocInfo) {
        throw new Error(`Thuốc ID ${item.thuocID} không tồn tại.`);
      }
      
      if (thuocInfo.tonKhoHienTai < item.soLuong) {
        throw new Error(`Thuốc ${thuocInfo.tenThuongMai} không đủ tồn kho (Chỉ còn ${thuocInfo.tonKhoHienTai}, yêu cầu ${item.soLuong}).`);
      }

      // BƯỚC 2: Thêm chi tiết đơn thuốc
      await new sql.Request(transaction)
        .input('donThuocID', sql.Int, header.donThuocID)
        .input('thuocID', sql.Int, item.thuocID)
        .input('lieuMoiLan', sql.Decimal(10, 2), item.lieuMoiLan)
        .input('soLanNgay', sql.Int, item.soLanNgay)
        .input('soNgay', sql.Int, item.soNgay)
        .input('soLuong', sql.Int, item.soLuong)
        .input('huongDan', sql.NVarChar(255), item.huongDan)
        .input('maxLieuNgay', sql.Decimal(10, 2), item.maxLieuNgay)
        .query(`
          INSERT INTO ChiTietDonThuoc (
            donThuocID, thuocID, lieuMoiLan, soLanNgay, soNgay, soLuong, huongDan, maxLieuNgay
          )
          VALUES (
            @donThuocID, @thuocID, @lieuMoiLan, @soLanNgay, @soNgay, @soLuong, @huongDan, @maxLieuNgay
          )
        `);

      // BƯỚC 3: Trừ tồn kho thực tế (Bug 2)
      await new sql.Request(transaction)
        .input('thuocID', sql.Int, item.thuocID)
        .input('soLuong', sql.Int, item.soLuong)
        .query(`
          UPDATE Thuoc 
          SET tonKhoHienTai = tonKhoHienTai - @soLuong 
          WHERE thuocID = @thuocID
        `);
    }

    await transaction.commit();
    return findById(header.donThuocID);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  findAll,
  findById,
  createDraft,
  createPrescription
};
