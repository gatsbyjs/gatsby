/**
 * Apply patches in order. Extracted from logic in release-next-major.js.
 */

const path = require(`path`)
const { execSync } = require(`child_process`)
const glob = require(`glob`)

const gatsbyPKG = require(`../packages/gatsby/package.json`)
const nextMajor = String(Number(gatsbyPKG.version.match(/[^.]+/)[0]) + 1)

const patchFiles = glob.sync(`patches/v${nextMajor}/*.patch`, {
  cwd: path.join(__dirname, `..`),
})

for (const patchFile of patchFiles) {
  console.log(`Applying patch ${patchFile}`)
  try {
    execSync(`git apply ${patchFile}`, {
      cwd: path.join(__dirname, `..`),
      stdio: `pipe`,
    })
  } catch (err) {
    console.log(err.stderr.toString())
    // eslint-disable-next-line
    throw ``
  }
}
