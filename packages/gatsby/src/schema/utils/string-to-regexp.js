const invariant = require(`invariant`)

const stringToRegExp = str => {
  const lastSlash = str.lastIndexOf(`/`)
  invariant(
    lastSlash > 0 && str.startsWith(`/`),
    `Regular expressions have to be surrounded by slashes, e.g. /\\.txt$/i`
  )
  return new RegExp(str.slice(1, lastSlash), str.slice(lastSlash + 1))
}

module.exports = stringToRegExp
