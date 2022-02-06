const sharp = require(`./safe-sharp`)

const supportedExtensions = {
  jpeg: true,
  jpg: true,
  png: true,
  webp: true,
  tif: true,
  tiff: true,
}

if (sharp.format.pdf.input.stream) {
  supportedExtensions.pdf = true
}

module.exports = {
  supportedExtensions,
}
