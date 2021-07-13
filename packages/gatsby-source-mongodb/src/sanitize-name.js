module.exports = function sanitizeName(s, capitalize = true) {
  const sanitizedName = s.replace(/[^_a-zA-Z0-9]/g, ``)
  return capitalize
    ? sanitizedName.replace(/\b\w/g, l => l.toUpperCase())
    : sanitizedName
}
