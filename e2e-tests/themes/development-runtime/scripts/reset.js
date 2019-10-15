const fs = require(`fs-extra`)
const path = require(`path`)

const { __HISTORY_FILE__, getHistory } = require(`./history`)

async function reset() {
  const history = await getHistory()

  await Promise.all(
    Array.from(history).map(([filePath, value]) => {
      if (typeof value === `string`) {
        return fs.writeFile(path.resolve(filePath), value, `utf8`)
      }
      return fs.remove(path.resolve(filePath))
    })
  )

  await fs.remove(__HISTORY_FILE__)
}

reset()
