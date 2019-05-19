const fs = require(`fs-extra`)
const path = require(`path`)
const base = __dirname
module.exports = fs.readdirSync(base).reduce((lookup, file) => {
  if (file !== `index.js`) {
    const name = file
      .replace(/-(\w)/g, (_, char) => char.toUpperCase())
      .replace(/\..+/, ``)
    lookup[name] = fs.readFileSync(path.join(base, file), `utf8`)
  }
  return lookup
}, {})
