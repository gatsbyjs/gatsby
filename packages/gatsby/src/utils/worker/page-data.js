const fs = require(`fs-extra`)
const path = require(`path`)
const Promise = require(`bluebird`)

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}

const updateJsonFileField = async (filename, fieldname, namedChunkHashes) => {
  const object = JSON.parse(await fs.readFile(filename, `utf-8`))
  object[fieldname] = namedChunkHashes[object.componentChunkName]
  await fs.outputFile(filename, JSON.stringify(object), `utf-8`)
}

const updateCompilationHashes = ({ publicDir }, pagePaths, namedChunkHashes) =>
  Promise.map(pagePaths, pagePath =>
    updateJsonFileField(
      getFilePath({ publicDir }, pagePath),
      `webpackCompilationHash`,
      namedChunkHashes
    )
  )

module.exports = {
  getFilePath,
  updateCompilationHashes,
}
