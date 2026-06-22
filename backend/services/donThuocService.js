const donThuocRepository = require('../repositories/donThuocRepository');
const { calculateDose } = require('../utils/dosageCalculator');
const crypto = require('crypto');
const { poolPromise, sql } = require('../db');
const { scanDrugInteractions } = require('../utils/InteractionEngine');

function createPrescriptionCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DT-${date}-${suffix}`;
}

function normalizeHeader(payload, user) {
  return {
    maDonThuoc: payload.maDonThuoc?.trim() || createPrescriptionCode(),
    tenBenhNhan: payload.tenBenhNhan?.trim() || '',
    ngayKeDon: payload.ngayKeDon || new Date().toISOString().slice(0, 10),
    ghiChu: payload.ghiChu?.trim() || null,
    createdBy: user?.displayName || user?.email || user?.role || null
  };
}

function validateHeader(data) {
  const errors = [];
  if (!data.tenBenhNhan) errors.push('Ten benh nhan la bat buoc');
  if (data.tenBenhNhan.length > 150) errors.push('Ten benh nhan khong duoc vuot qua 150 ky tu');
  if (!/^DT-[A-Z0-9-]+$/.test(data.maDonThuoc)) errors.push('Ma don thuoc khong hop le');
  return errors;
}

function throwValidationError(errors) {
  const error = new Error('Du lieu don thuoc khong hop le');
  error.statusCode = 400;
  error.details = errors;
  throw error;
}

function normalizeDetail(item) {
  return {
    thuocID: Number.parseInt(item.thuocID, 10),
    lieuMoiLan: Number(item.lieuMoiLan),
    soLanNgay: Number.parseInt(item.soLanNgay, 10),
    soNgay: Number.parseInt(item.soNgay, 10),
    soLuong: Number.parseInt(item.soLuong, 10),
    huongDan: item.huongDan?.trim() || null,
    maxLieuNgay: item.maxLieuNgay === '' || item.maxLieuNgay == null ? null : Number(item.maxLieuNgay)
  };
}

function validateDetails(items) {
  const errors = [];
  if (!items.length) errors.push('Don thuoc phai co it nhat mot thuoc');

  const medicineIDs = new Set();
  items.forEach((item, index) => {
    const label = `Dong ${index + 1}`;
    if (!Number.isInteger(item.thuocID) || item.thuocID <= 0) errors.push(`${label}: thuoc khong hop le`);
    if (!Number.isFinite(item.lieuMoiLan) || item.lieuMoiLan <= 0) errors.push(`${label}: lieu moi lan phai lon hon 0`);
    if (!Number.isInteger(item.soLanNgay) || item.soLanNgay <= 0) errors.push(`${label}: so lan ngay phai lon hon 0`);
    if (!Number.isInteger(item.soNgay) || item.soNgay <= 0) errors.push(`${label}: so ngay phai lon hon 0`);
    if (!Number.isInteger(item.soLuong) || item.soLuong <= 0) errors.push(`${label}: so luong phai lon hon 0`);
    if (medicineIDs.has(item.thuocID)) errors.push(`${label}: thuoc bi trung trong don`);
    medicineIDs.add(item.thuocID);
  });

  return errors;
}

async function listDonThuoc() {
  return donThuocRepository.findAll();
}

async function getDonThuoc(donThuocID) {
  return donThuocRepository.findById(donThuocID);
}

async function createDraft(payload, user) {
  const data = normalizeHeader(payload, user);
  const errors = validateHeader(data);
  if (errors.length) throwValidationError(errors);
  return donThuocRepository.createDraft(data);
}

async function createPrescription(payload, user) {
  const header = normalizeHeader(payload, user);
  const chiTiet = Array.isArray(payload.chiTiet) ? payload.chiTiet.map(normalizeDetail) : [];
  const errors = [...validateHeader(header), ...validateDetails(chiTiet)];
  if (errors.length) throwValidationError(errors);

  // Lấy tên thuốc từ DB để quét tương tác
  const pool = await poolPromise;
  const thuocIDs = chiTiet.map(item => item.thuocID);
  
  if (thuocIDs.length > 1) {
    const thuocResult = await pool.request().query(`
      SELECT thuocID, tenThuongMai as ten 
      FROM Thuoc 
      WHERE thuocID IN (${thuocIDs.join(',')})
    `);
    
    // Quét tương tác thuốc
    const canhBao = scanDrugInteractions(thuocResult.recordset);
    if (canhBao && canhBao.length > 0) {
      const errorMsgs = canhBao.map(cb => `Tương tác ${cb.capThuoc}: ${cb.chiTiet}`);
      throwValidationError(errorMsgs);
    }
  }

  return donThuocRepository.createPrescription({ ...header, chiTiet });
}

function checkDose(payload) {
  return calculateDose({
    lieuMoiLan: payload.lieuMoiLan,
    soLanNgay: payload.soLanNgay,
    soNgay: payload.soNgay,
    maxLieuNgay: payload.maxLieuNgay
  });
}

module.exports = {
  listDonThuoc,
  getDonThuoc,
  createDraft,
  createPrescription,
  checkDose,
  normalizeHeader,
  validateHeader,
  throwValidationError
};
