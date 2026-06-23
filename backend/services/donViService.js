const { isValidUnit, SOLID_UNIT_FACTORS } = require('../constants/medicineCatalog');

function convertUnit({ quantity, fromUnit, toUnit }) {
  const amount = Number(quantity);

  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error('So luong can doi phai la so khong am');
    error.statusCode = 400;
    throw error;
  }

  if (!isValidUnit(fromUnit) || !isValidUnit(toUnit)) {
    const error = new Error('Don vi tinh khong hop le');
    error.statusCode = 400;
    throw error;
  }

  if (fromUnit === toUnit) {
    return { quantity: amount, fromUnit, toUnit, result: amount };
  }

  if (!SOLID_UNIT_FACTORS[fromUnit] || !SOLID_UNIT_FACTORS[toUnit]) {
    const error = new Error('Chi ho tro doi cheo giua hop, vi va vien; cac don vi khac chi doi 1:1 cung loai');
    error.statusCode = 400;
    throw error;
  }

  const baseQuantity = amount * SOLID_UNIT_FACTORS[fromUnit];
  const result = baseQuantity / SOLID_UNIT_FACTORS[toUnit];

  return {
    quantity: amount,
    fromUnit,
    toUnit,
    result
  };
}

module.exports = {
  convertUnit
};
