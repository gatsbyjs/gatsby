const readdirp = require(`readdirp-walk`)

const ignoredRE = /^\./
const ignored = [`yarn.lock`, `package-lock.json`, `node_modules`, `dist`]

function fileFinder(dir) {
  return new Promise(resolve => {
    let fileList = []
    const stream = readdirp({ root: dir })

    stream.on(`data`, data => {
      const { name, fullPath, stat } = data

      if (
        stat.isDirectory() ||
        ignoredRE.test(name) ||
        ignored.includes(name)
      ) {
        return
      }
      if (fullPath.includes(`node_modules`) || fullPath.includes(`build`)) {
        return
      }
      fileList.push(fullPath)
      return
    })

    stream.on(`end`, () => {
      resolve(fileList)
    })
  })
}

module.exports = fileFinder
