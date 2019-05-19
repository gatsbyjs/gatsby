const fs = require(`fs-extra`)

const HISTORY_FILE = `__history__.json`

exports.__HISTORY_FILE__ = HISTORY_FILE

exports.getHistory = async (file = HISTORY_FILE) => {
  try {
    const contents = await fs
      .readFile(file, `utf8`)
      .then(contents => JSON.parse(contents))

    return new Map(contents)
  } catch (e) {
    return new Map()
  }
}

exports.writeHistory = async (contents, file = HISTORY_FILE) => {
  try {
    await fs.writeFile(file, JSON.stringify([...contents]), `utf8`)
  } catch (e) {
    console.error(e)
  }
}
