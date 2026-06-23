const ATC_PATTERN = /^[A-Z][0-9]{2}[A-Z]{2}[0-9]{2}$/;

function normalizeAtc(value) {
  return String(value || '').trim().toUpperCase();
}

function isValidAtc(value) {
  return ATC_PATTERN.test(normalizeAtc(value));
}

function getAtcMessage(value) {
  if (!value) return 'Ma ATC la bat buoc';
  if (!isValidAtc(value)) return 'Ma ATC phai dung dinh dang vi du J01CA04';
  return null;
}

module.exports = {
  ATC_PATTERN,
  normalizeAtc,
  isValidAtc,
  getAtcMessage
};
