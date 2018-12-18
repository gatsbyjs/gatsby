const fs = require(`fs-extra`)
const path = require(`path`)

module.exports = () => {
  const staticDir = path.join(process.cwd(), `static`)
  if (!fs.existsSync(staticDir)) return
  fs.copySync(staticDir, path.join(process.cwd(), `public`))
}
