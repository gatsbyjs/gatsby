const fs = require(`fs`)

module.exports.ellipses = ellipses
module.exports.ensureDir = ensureDir

function ellipses(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + `...`
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}
