import { readFileSync } from "fs"
import sharp from "gatsby-sharp/dist/sharp"

sharp.simd(true)
sharp.concurrency(1)

module.exports = function getSharpInstance() {
  return sharp
}

// this function is only used to ensure sharp binaries are bundled
// this function is never actually executed
module.exports.forceAllOfSharpBinaries = function forceAllOfSharpBinaries(
  name
) {
  try {
    const packagePath = require.resolve(`@img/sharp-libvips-linux-x64/package`)
    // const packagePath = require.resolve(`@img/sharp-libvips-darwin-arm64/package`)
    return readFileSync(`${packagePath}/../${name}`, `utf8`)
  } catch {
    const packagePath = require.resolve(`@img/sharp-linux-x64/package`)
    // const packagePath = require.resolve(`@img/sharp-darwin-arm64/package`)
    return readFileSync(`${packagePath}/../${name}`, `utf8`)
  }
}
