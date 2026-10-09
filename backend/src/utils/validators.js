/**
 * Form Validation Rules according to Coding Challenge requirements:
 * - Name: Min 20 characters, Max 60 characters.
 * - Address: Max 400 characters.
 * - Password: 8-16 characters, must include at least one uppercase letter and one special character.
 * - Email: Must follow standard email validation rules.
 */

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 20 && trimmed.length <= 60;
};

const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return trimmed.length > 0 && trimmed.length <= 400;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  // 8-16 characters, must include at least one uppercase letter and one special character
  if (password.length < 8 || password.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUppercase && hasSpecialChar;
};

module.exports = {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
};
