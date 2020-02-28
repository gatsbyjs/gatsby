import path from "path"

module.exports = () => {
  try {
    return require(path.join(
      process.cwd(),
      `node_modules`,
      `gatsby`,
      `package.json`
    )).version
  } catch (e) {
    return ``
  }
}
