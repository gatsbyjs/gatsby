const v8 = require(`v8`)
const fs = require(`fs-extra`)

const file = () => `${process.cwd()}/.cache/redux.state`

const readFromCache = () => v8.deserialize(fs.readFileSync(file()))

const writeToCache = contents =>
  fs.writeFileSync(file(), v8.serialize(contents))

module.exports = { readFromCache, writeToCache }
