const nhomThuocRepository = require('../repositories/nhomThuocRepository');

function normalizeGroupPayload(payload) {
  return {
    tenNhom: payload.tenNhom ? payload.tenNhom.trim() : null,
    moTa: payload.moTa ? payload.moTa.trim() : null,
    trangThai: payload.trangThai === undefined ? true : Boolean(payload.trangThai)
  };
}

function validateGroup(data) {
  const errors = [];
  if (!data.tenNhom) errors.push('Ten nhom thuoc la bat buoc');
  if (data.tenNhom && data.tenNhom.length > 120) errors.push('Ten nhom thuoc toi da 120 ky tu');
  return errors;
}

async function listGroups() {
  return nhomThuocRepository.findAll();
}

async function createGroup(payload) {
  const data = normalizeGroupPayload(payload);
  const errors = validateGroup(data);

  if (errors.length > 0) {
    const error = new Error('Du lieu nhom thuoc khong hop le');
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  return nhomThuocRepository.createGroup(data);
}

async function updateGroup(nhomThuocID, payload) {
  const data = normalizeGroupPayload(payload);
  const errors = validateGroup(data);

  if (errors.length > 0) {
    const error = new Error('Du lieu nhom thuoc khong hop le');
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  return nhomThuocRepository.updateGroup(nhomThuocID, data);
}

async function deleteGroup(nhomThuocID) {
  return nhomThuocRepository.removeGroup(nhomThuocID);
}

module.exports = {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup
};
