const path = require(`path`)
const gatsbyPath = path.resolve(
  __dirname,
  `..`,
  `www`,
  `node_modules`,
  `gatsby`,
  `dist`
)
const explorer = require(path.resolve(
  gatsbyPath,
  `commands`,
  `data-explorer.js`
))

const port = process.env.PORT || 8080
const host = `0.0.0.0`
const directory = path.join(__dirname, `..`, `www`)
const sitePackageJson = require(path.join(directory, `package.json`))

explorer({
  port,
  host,
  directory,
  sitePackageJson,
})
