const fs = require(`fs-extra`)
const path = require(`path`)

const APP_DATA_JSON = `app-data.json`

const write = (publicDir, hash) => {
  fs.outputJson(path.join(publicDir, `page-data`, APP_DATA_JSON), {
    webpackCompilationHash: hash,
  })
}

const exists = publicDir =>
  fs.pathExistsSync(path.join(publicDir, `page-data`, APP_DATA_JSON))

module.exports = {
  write,
  exists,
}
