function toPositiveNumber(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} phai la so lon hon 0`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function roundDose(value) {
  return Number(value.toFixed(2));
}

function calculateDose({ lieuMoiLan, soLanNgay, soNgay = 1, maxLieuNgay = null }) {
  const dosePerUse = toPositiveNumber(lieuMoiLan, 'Lieu moi lan');
  const timesPerDay = toPositiveNumber(soLanNgay, 'So lan ngay');
  const days = toPositiveNumber(soNgay, 'So ngay');
  const dailyDose = roundDose(dosePerUse * timesPerDay);
  const courseDose = roundDose(dailyDose * days);

  if (maxLieuNgay === null || maxLieuNgay === '' || maxLieuNgay === undefined) {
    return {
      lieuMoiLan: dosePerUse,
      soLanNgay: timesPerDay,
      soNgay: days,
      tongLieuNgay: dailyDose,
      tongLieuDot: courseDose,
      maxLieuNgay: null,
      trangThai: 'CHUA_THIET_LAP_GIOI_HAN',
      vuotMuc: 0
    };
  }

  const maxDailyDose = toPositiveNumber(maxLieuNgay, 'Gioi han lieu ngay');
  const excess = roundDose(Math.max(dailyDose - maxDailyDose, 0));
  return {
    lieuMoiLan: dosePerUse,
    soLanNgay: timesPerDay,
    soNgay: days,
    tongLieuNgay: dailyDose,
    tongLieuDot: courseDose,
    maxLieuNgay: maxDailyDose,
    trangThai: excess > 0 ? 'VUOT_LIEU' : 'AN_TOAN',
    vuotMuc: excess
  };
}

module.exports = {
  calculateDose
};
