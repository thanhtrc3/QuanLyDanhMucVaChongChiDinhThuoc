const { poolPromise, sql } = require('../db');

async function findAll() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT d.donThuocID as id, d.donThuocID as maDonThuoc, d.ngayLap as ngayKeDon, d.chanDoan, d.trangThai,
           b.hoTen as tenBenhNhan, n.hoTen as tenBacSi,
           COUNT(c.chiTietID) AS soLoaiThuoc
    FROM DonThuoc d
    LEFT JOIN BenhNhan b ON d.benhNhanID = b.benhNhanID
    LEFT JOIN NguoiDung n ON d.bacSiID = n.userId
    LEFT JOIN ChiTietDonThuoc c ON c.donThuocID = d.donThuocID
    GROUP BY d.donThuocID, d.ngayLap, d.chanDoan, d.trangThai, b.hoTen, n.hoTen
    ORDER BY d.ngayLap DESC
  `);

  return result.recordset;
}

async function findById(donThuocID) {
  const pool = await poolPromise;
  const headerResult = await pool.request()
    .input('donThuocID', sql.Int, donThuocID)
    .query(`
      SELECT d.donThuocID as id, d.donThuocID as maDonThuoc, d.ngayLap as ngayKeDon, d.chanDoan, d.trangThai,
             b.hoTen as tenBenhNhan, n.hoTen as tenBacSi, d.benhNhanID, d.bacSiID
      FROM DonThuoc d
      LEFT JOIN BenhNhan b ON d.benhNhanID = b.benhNhanID
      LEFT JOIN NguoiDung n ON d.bacSiID = n.userId
      WHERE d.donThuocID = @donThuocID
    `);

  const header = headerResult.recordset[0];
  if (!header) return null;

  const detailResult = await pool.request()
    .input('donThuocID', sql.Int, donThuocID)
    .query(`
      SELECT c.*, c.thuocID as id, t.tenThuongMai as tenThuoc, t.donViTinh, t.tonKhoHienTai as tonKho
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
    .input('bacSiID', sql.Int, data.bacSiID)
    .input('benhNhanID', sql.Int, data.benhNhanID)
    .input('chanDoan', sql.NVarChar(500), data.chanDoan || '')
    .query(`
      INSERT INTO DonThuoc (bacSiID, benhNhanID, chanDoan, trangThai, ngayLap)
      OUTPUT INSERTED.*
      VALUES (@bacSiID, @benhNhanID, @chanDoan, N'Nháp', GETDATE())
    `);

  return { ...result.recordset[0], chiTiet: [] };
}

async function createPrescription(data) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const request = transaction.request();
    
    // 1. Insert header
    const headerRes = await request
      .input('bacSiID', sql.Int, data.bacSiID)
      .input('benhNhanID', sql.Int, data.benhNhanID)
      .input('chanDoan', sql.NVarChar(500), data.chanDoan || '')
      .input('trangThai', sql.NVarChar(50), data.trangThai || 'Đã cấp')
      .query(`
        INSERT INTO DonThuoc (bacSiID, benhNhanID, chanDoan, trangThai, ngayLap)
        OUTPUT INSERTED.*
        VALUES (@bacSiID, @benhNhanID, @chanDoan, @trangThai, GETDATE())
      `);

    const header = headerRes.recordset[0];
    const createdChiTiet = [];

    // 2. Insert details
    if (data.chiTiet && data.chiTiet.length > 0) {
      for (const item of data.chiTiet) {
        const detReq = transaction.request();
        const detRes = await detReq
          .input('donThuocID', sql.Int, header.donThuocID)
          .input('thuocID', sql.Int, item.thuocID)
          .input('soLuong', sql.Int, item.soLuong)
          .input('lieuMoiLan', sql.Float, parseFloat(item.lieuMoiLan) || 1)
          .input('soLanDungNgay', sql.Int, parseInt(item.soLanDungNgay) || 1)
          .query(`
            INSERT INTO ChiTietDonThuoc (donThuocID, thuocID, soLuong, lieuMoiLan, soLanDungNgay)
            OUTPUT INSERTED.*
            VALUES (@donThuocID, @thuocID, @soLuong, @lieuMoiLan, @soLanDungNgay)
          `);
          
        createdChiTiet.push(detRes.recordset[0]);
        
        // 3. Trừ tồn kho thuốc
        const updateStockReq = transaction.request();
        await updateStockReq
          .input('thuocID', sql.Int, item.thuocID)
          .input('soLuong', sql.Int, item.soLuong)
          .query(`
            UPDATE Thuoc
            SET tonKhoHienTai = tonKhoHienTai - @soLuong
            WHERE thuocID = @thuocID AND tonKhoHienTai >= @soLuong
          `);
      }
    }

    await transaction.commit();
    return { ...header, id: header.donThuocID, maDonThuoc: `DT${header.donThuocID}`, chiTiet: createdChiTiet };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function updateStatus(id, trangThai) {
  const pool = await poolPromise;
  await pool.request()
    .input('id', sql.Int, id)
    .input('trangThai', sql.NVarChar(50), trangThai)
    .query(`
      UPDATE DonThuoc SET trangThai = @trangThai WHERE donThuocID = @id
    `);
}

async function cancelDonThuoc(id) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const request = transaction.request();
    
    // 1. Lấy thông tin đơn thuốc để xem đã hủy chưa
    const currentRes = await request
      .input('donThuocID', sql.Int, id)
      .query(`SELECT trangThai FROM DonThuoc WHERE donThuocID = @donThuocID`);
      
    if (currentRes.recordset.length === 0) throw new Error('Không tìm thấy đơn thuốc');
    if (currentRes.recordset[0].trangThai === 'Hủy') {
      await transaction.rollback();
      return true; // Đã hủy rồi thì thôi
    }

    // 2. Lấy chi tiết đơn thuốc để hoàn lại số lượng tồn kho
    const detailsReq = transaction.request();
    const detailsRes = await detailsReq
      .input('donThuocID', sql.Int, id)
      .query(`SELECT thuocID, soLuong FROM ChiTietDonThuoc WHERE donThuocID = @donThuocID`);
      
    const details = detailsRes.recordset;

    // 3. Hoàn lại tồn kho
    for (const item of details) {
      const restoreReq = transaction.request();
      await restoreReq
        .input('thuocID', sql.Int, item.thuocID)
        .input('soLuong', sql.Int, item.soLuong)
        .query(`
          UPDATE Thuoc
          SET tonKhoHienTai = tonKhoHienTai + @soLuong
          WHERE thuocID = @thuocID
        `);
    }

    // 4. Đổi trạng thái thành Hủy
    const updateHeaderReq = transaction.request();
    await updateHeaderReq
      .input('donThuocID', sql.Int, id)
      .query(`UPDATE DonThuoc SET trangThai = N'Hủy' WHERE donThuocID = @donThuocID`);

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function deleteDonThuoc(id) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const request = transaction.request();
    
    // 1. Get details to restore stock
    const detailsRes = await request
      .input('donThuocID', sql.Int, id)
      .query(`SELECT thuocID, soLuong FROM ChiTietDonThuoc WHERE donThuocID = @donThuocID`);
      
    const details = detailsRes.recordset;

    // 2. Restore stock
    for (const item of details) {
      const restoreReq = transaction.request();
      await restoreReq
        .input('thuocID', sql.Int, item.thuocID)
        .input('soLuong', sql.Int, item.soLuong)
        .query(`
          UPDATE Thuoc
          SET tonKhoHienTai = tonKhoHienTai + @soLuong
          WHERE thuocID = @thuocID
        `);
    }

    // 3. Delete details
    const deleteDetailsReq = transaction.request();
    await deleteDetailsReq
      .input('donThuocID', sql.Int, id)
      .query(`DELETE FROM ChiTietDonThuoc WHERE donThuocID = @donThuocID`);

    // 4. Delete header
    const deleteHeaderReq = transaction.request();
    const result = await deleteHeaderReq
      .input('donThuocID', sql.Int, id)
      .query(`DELETE FROM DonThuoc WHERE donThuocID = @donThuocID`);

    if (result.rowsAffected[0] === 0) {
        throw new Error('Không tìm thấy đơn thuốc để xóa');
    }

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = {
  findAll,
  findById,
  createDraft,
  createPrescription,
  updateStatus,
  cancelDonThuoc,
  deleteDonThuoc
};
