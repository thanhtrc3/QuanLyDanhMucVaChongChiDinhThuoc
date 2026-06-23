const { calculateDose } = require('../../backend/utils/dosageCalculator');

describe('Dosage Calculator Unit Tests', () => {
  test('TC-U01: Should calculate safe dose correctly', () => {
    const safeDose = calculateDose({ lieuMoiLan: 1, soLanNgay: 3, soNgay: 5, maxLieuNgay: 4 });
    expect(safeDose.tongLieuNgay).toBe(3);
    expect(safeDose.tongLieuDot).toBe(15);
    expect(safeDose.trangThai).toBe('AN_TOAN');
    expect(safeDose.vuotMuc).toBe(0);
  });

  test('TC-U02: Should detect exceeded dose correctly', () => {
    const exceededDose = calculateDose({ lieuMoiLan: 2.5, soLanNgay: 3, soNgay: 2, maxLieuNgay: 6 });
    expect(exceededDose.tongLieuNgay).toBe(7.5);
    expect(exceededDose.tongLieuDot).toBe(15);
    expect(exceededDose.trangThai).toBe('VUOT_LIEU');
    expect(exceededDose.vuotMuc).toBe(1.5); // 7.5 - 6
  });

  test('TC-U03: Should handle case with no limit set', () => {
    const noLimit = calculateDose({ lieuMoiLan: 0.5, soLanNgay: 2, soNgay: 7 });
    expect(noLimit.trangThai).toBe('CHUA_THIET_LAP_GIOI_HAN');
  });

  test('TC-U04: Should throw error on invalid input (lieuMoiLan <= 0)', () => {
    expect(() => calculateDose({ lieuMoiLan: 0, soLanNgay: 1 })).toThrow(/Lieu moi lan/);
  });
});
