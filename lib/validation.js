/**
 * Basic email format check (practical, not full RFC).
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const s = email.trim();
  if (s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * Indian mobile: 10 digits starting 6–9, or with +91 / leading 0.
 */
export function isValidIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
  if (digits.length === 12 && digits.startsWith('91')) return /^91[6-9]\d{9}$/.test(digits);
  if (digits.length === 11 && digits.startsWith('0')) return /^0[6-9]\d{9}$/.test(digits);
  return false;
}

export function normalizeIndianPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}
