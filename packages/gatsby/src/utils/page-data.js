const fs = require(`fs-extra`)
const path = require(`path`)
const telemetry = require(`gatsby-telemetry`)

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}
const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const write = async ({ publicDir }, page, result) => {
  const filePath = getFilePath({ publicDir }, page.path)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    matchPath: page.matchPath,
    result,
  }
  const bodyStr = JSON.stringify(body)
  const pageDataSize = Buffer.byteLength(bodyStr)
  console.log(`buffering pade data size ${pageDataSize}`)
  telemetry.addBufferedMeasurementsOnEvent(
    `BUILD_END`,
    `pageDataStats`,
    pageDataSize
  ),
    await fs.outputFile(filePath, bodyStr)
}

module.exports = {
  read,
  write,
}
