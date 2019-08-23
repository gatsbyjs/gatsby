module.exports.ellipses = ellipses

function ellipses(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + `...`
}
