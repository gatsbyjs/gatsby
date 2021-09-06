const glob = require(`glob`)
const { sync: execSync } = require(`execa`)

export const applyPatches = async (root, major) => {
  const patchFiles = glob.sync(`patches/v${major}/*.patch`, {
    cwd: root,
  })

  patchFiles.forEach(file => {
    console.log(`Applying patch ${file}`)
    try {
      execSync(`git`, [`apply`, file], {
        cwd: root,
        stdio: `pipe`,
      })
    } catch (err) {
      console.log(err)
      // eslint-disable-next-line
      throw ``
    }
  })
}

export const removePatches = async (root, major) => {
  const patchFiles = glob.sync(`patches/v${major}/*.patch`, {
    cwd: root,
  })

  patchFiles.reverse().forEach(file => {
    console.log(`Removing patch ${file}`)
    try {
      execSync(`git`, [`apply`, `-R`, file], {
        cwd: root,
        stdio: `pipe`,
      })
    } catch (err) {
      console.log(err)
      // eslint-disable-next-line
      throw ``
    }
  })
}
