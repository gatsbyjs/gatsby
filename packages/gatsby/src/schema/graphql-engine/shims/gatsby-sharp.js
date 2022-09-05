import sharp from "sharp"

sharp.simd(true)
sharp.concurrency(1)

module.exports = function getSharpInstance() {
  return sharp
}
