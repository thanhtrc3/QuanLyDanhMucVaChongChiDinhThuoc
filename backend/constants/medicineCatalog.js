const MEDICINE_CATEGORIES = [
  'Kháng sinh',
  'Giảm đau - hạ sốt',
  'Tim mạch',
  'Tiêu hóa',
  'Hô hấp',
  'Dị ứng',
  'Vitamin - khoáng chất',
  'Khác'
];

const MEDICINE_TARGETS = [
  'Người lớn',
  'Trẻ em',
  'Phụ nữ có thai',
  'Tất cả'
];

const MEDICINE_UNITS = [
  'viên',
  'vỉ',
  'hộp',
  'chai',
  'ống',
  'gói',
  'tuýp',
  'lọ'
];

const SOLID_UNIT_FACTORS = {
  'viên': 1,
  'vỉ': 10,
  'hộp': 100
};

function isValidTarget(value) {
  return MEDICINE_TARGETS.includes(value);
}

function isValidCategory(value) {
  return MEDICINE_CATEGORIES.includes(value);
}

function isValidUnit(value) {
  return MEDICINE_UNITS.includes(value);
}

module.exports = {
  MEDICINE_CATEGORIES,
  MEDICINE_UNITS,
  MEDICINE_TARGETS,
  SOLID_UNIT_FACTORS,
  isValidCategory,
  isValidUnit,
  isValidTarget
};
