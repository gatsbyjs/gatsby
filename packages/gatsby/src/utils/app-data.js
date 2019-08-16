const fs = require(`fs-extra`)
const path = require(`path`)

const APP_DATA_JSON = `app-data.json`

const write = (publicDir, hash) => {
  fs.writeJson(path.join(publicDir, APP_DATA_JSON), {
    appHash: hash,
  })
}

const exists = publicDir =>
  fs.pathExistsSync(path.join(publicDir, APP_DATA_JSON))

module.exports = {
  write,
  exists,
}
