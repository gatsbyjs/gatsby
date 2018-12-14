const fs = require(`fs-extra`)
const path = require(`path`)
const yargs = require(`yargs`)

const { getHistory, writeHistory } = require(`./history`)

const args = yargs
  .option(`file`, {
    demand: true,
    type: `string`,
  })
  .option(`replacements`, {
    demand: true,
    type: `array`,
  }).argv

async function update() {
  const history = await getHistory()

  const { file: fileArg, replacements } = args
  const filePath = path.resolve(fileArg)
  let file = await fs.readFile(filePath, `utf8`)

  if (!history.has(filePath)) {
    history.set(filePath, file)
  }

  const contents = replacements.reduce((replaced, pair) => {
    const [key, value] = pair.split(`:`)
    return replaced.replace(new RegExp(`%${key}%`, `g`), value)
  }, file)

  await fs.writeFile(filePath, contents, `utf8`)

  await writeHistory(history)
}

update()
