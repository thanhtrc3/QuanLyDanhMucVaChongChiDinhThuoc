const assert = require('node:assert/strict');
const { calculateDose } = require('../utils/dosageCalculator');

const safeDose = calculateDose({ lieuMoiLan: 1, soLanNgay: 3, soNgay: 5, maxLieuNgay: 4 });
assert.equal(safeDose.tongLieuNgay, 3);
assert.equal(safeDose.tongLieuDot, 15);
assert.equal(safeDose.trangThai, 'AN_TOAN');
assert.equal(safeDose.vuotMuc, 0);

const exceededDose = calculateDose({ lieuMoiLan: 2.5, soLanNgay: 3, soNgay: 2, maxLieuNgay: 6 });
assert.equal(exceededDose.tongLieuNgay, 7.5);
assert.equal(exceededDose.tongLieuDot, 15);
assert.equal(exceededDose.trangThai, 'VUOT_LIEU');
assert.equal(exceededDose.vuotMuc, 1.5);

const noLimit = calculateDose({ lieuMoiLan: 0.5, soLanNgay: 2, soNgay: 7 });
assert.equal(noLimit.trangThai, 'CHUA_THIET_LAP_GIOI_HAN');

assert.throws(() => calculateDose({ lieuMoiLan: 0, soLanNgay: 1 }), /Lieu moi lan/);

console.log('dosageCalculator tests passed');
