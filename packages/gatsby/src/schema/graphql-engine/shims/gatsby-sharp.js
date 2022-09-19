import sharp from "gatsby-sharp/dist/sharp"

sharp.simd(true)
sharp.concurrency(1)

module.exports = function getSharpInstance() {
  return sharp
}
