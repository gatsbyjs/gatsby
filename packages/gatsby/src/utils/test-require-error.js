module.exports = (moduleName, err) => {
  const regex = new RegExp(`Error: Cannot find module\\s'${moduleName}`)
  const firstLine = err.toString().split(`\n`)[0]
  return regex.test(firstLine)
}
