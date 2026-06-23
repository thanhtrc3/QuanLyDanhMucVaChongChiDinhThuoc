const thuocRepository = require('../repositories/thuocRepository');
const { getAtcMessage, normalizeAtc } = require('../utils/atcValidator');
const { isValidCategory, isValidUnit } = require('../constants/medicineCatalog');

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeThuocPayload(payload) {
  return {
    maATC: normalizeAtc(payload.maATC),
    tenThuong: payload.tenThuong ? payload.tenThuong.trim() : null,
    hoatChat: payload.hoatChat ? payload.hoatChat.trim() : null,
    nhomThuoc: payload.nhomThuoc ? payload.nhomThuoc.trim() : 'Khác',
    doiTuong: payload.doiTuong ? payload.doiTuong.trim() : 'Tất cả',
    donVi: payload.donVi ? payload.donVi.trim() : null,
    giaBan: payload.giaBan ? parseFloat(payload.giaBan) : 0,
    tonKho: toInt(payload.tonKho),
    tonKhoToiThieu: toInt(payload.tonKhoToiThieu),
    hanDung: payload.hanDung || null,
    moTa: payload.moTa || '',
    trangThai: payload.trangThai !== false
  };
}

function validateRequiredFields(data) {
  const errors = [];

  const atcMessage = getAtcMessage(data.maATC);
  if (atcMessage) errors.push(atcMessage);
  if (!data.tenThuong) errors.push('Tên thuốc là bắt buộc');
  if (!data.hoatChat) errors.push('Hoạt chất là bắt buộc');
  if (!data.donVi) errors.push('Đơn vị tính là bắt buộc');
  if (data.donVi && !isValidUnit(data.donVi)) errors.push('Đơn vị tính không hợp lệ');
  if (data.tonKho < 0 || data.tonKhoToiThieu < 0) errors.push('Tồn kho không được âm');
  if (data.giaBan < 0) errors.push('Giá bán không được âm');

  return errors;
}

async function listThuoc(filters) {
  return thuocRepository.findAll({
    keyword: filters.keyword ? filters.keyword.trim() : ''
  });
}

async function getThuoc(thuocID) {
  return thuocRepository.findById(thuocID);
}

async function searchThuoc(filters) {
  const limit = Math.min(Math.max(toInt(filters.limit, 8), 1), 20);
  return thuocRepository.findSuggestions({
    keyword: filters.keyword ? filters.keyword.trim() : '',
    limit
  });
}

async function createThuoc(payload) {
  const data = normalizeThuocPayload(payload);
  const errors = validateRequiredFields(data);

  if (errors.length > 0) {
    const error = new Error('Du lieu thuoc khong hop le');
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  return thuocRepository.createThuoc(data);
}

async function updateThuoc(thuocID, payload) {
  const data = normalizeThuocPayload(payload);
  const errors = validateRequiredFields(data);

  if (errors.length > 0) {
    const error = new Error('Du lieu thuoc khong hop le');
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  return thuocRepository.updateThuoc(thuocID, data);
}

async function deleteThuoc(thuocID) {
  return thuocRepository.removeThuoc(thuocID);
}

module.exports = {
  listThuoc,
  getThuoc,
  searchThuoc,
  createThuoc,
  updateThuoc,
  deleteThuoc
};
