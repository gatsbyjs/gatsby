const { execSync } = require(`child_process`)
const glob = require(`glob`)
const path = require(`path`)

exports.applyPatches = function applyPatches(major) {
  const patchFiles = glob.sync(`patches/v${major}/*.patch`, {
    cwd: path.join(__dirname, `..`),
  })

  console.log(`=== APPLYING GIT PATCHES ===`)

  patchFiles.forEach(file => {
    console.log(`Applying patch ${file}`)
    try {
      execSync(`git apply ${file}`, {
        cwd: path.join(__dirname, `..`),
        stdio: `pipe`,
      })
    } catch (err) {
      console.log(err.stderr.toString())
      // eslint-disable-next-line
      throw ``
    }
  })
}
