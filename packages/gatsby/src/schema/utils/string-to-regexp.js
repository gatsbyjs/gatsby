const stringToRegExp = str => {
  const lastSlash = str.lastIndexOf(`/`)
  return new RegExp(str.slice(1, lastSlash), str.slice(lastSlash + 1))
}

module.exports = stringToRegExp
