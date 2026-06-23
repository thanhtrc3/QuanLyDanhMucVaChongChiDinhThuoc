const { poolPromise, sql } = require('../db');

async function findAll() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT nhomThuocID, tenNhom, moTa, trangThai
    FROM NhomThuoc
    ORDER BY tenNhom ASC
  `);

  return result.recordset;
}

async function createGroup(data) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('tenNhom', sql.NVarChar(120), data.tenNhom)
    .input('moTa', sql.NVarChar(255), data.moTa)
    .query(`
      INSERT INTO NhomThuoc (tenNhom, moTa)
      OUTPUT INSERTED.nhomThuocID, INSERTED.tenNhom, INSERTED.moTa, INSERTED.trangThai
      VALUES (@tenNhom, @moTa)
    `);

  return result.recordset[0];
}

async function updateGroup(nhomThuocID, data) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('nhomThuocID', sql.Int, nhomThuocID)
    .input('tenNhom', sql.NVarChar(120), data.tenNhom)
    .input('moTa', sql.NVarChar(255), data.moTa)
    .input('trangThai', sql.Bit, data.trangThai)
    .query(`
      UPDATE NhomThuoc
      SET tenNhom = @tenNhom,
          moTa = @moTa,
          trangThai = @trangThai
      OUTPUT INSERTED.nhomThuocID, INSERTED.tenNhom, INSERTED.moTa, INSERTED.trangThai
      WHERE nhomThuocID = @nhomThuocID
    `);

  return result.recordset[0] || null;
}

async function removeGroup(nhomThuocID) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  await transaction.begin();
  try {
    await new sql.Request(transaction)
      .input('nhomThuocID', sql.Int, nhomThuocID)
      .query('UPDATE Thuoc SET nhomThuocID = NULL WHERE nhomThuocID = @nhomThuocID');

    const result = await new sql.Request(transaction)
      .input('nhomThuocID', sql.Int, nhomThuocID)
      .query('DELETE FROM NhomThuoc WHERE nhomThuocID = @nhomThuocID');

    await transaction.commit();
    return result.rowsAffected[0] > 0;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  findAll,
  createGroup,
  updateGroup,
  removeGroup
};
