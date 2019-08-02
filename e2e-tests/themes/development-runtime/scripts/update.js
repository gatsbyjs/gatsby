const fs = require(`fs-extra`)
const yargs = require(`yargs`)

const { getHistory, writeHistory } = require(`./history`)

const args = yargs
  .option(`file`, {
    demand: true,
    type: `string`,
  })
  .option(`newFile`, {
    type: `string`,
  }).argv

async function update() {
  const history = await getHistory()

  const { file, newFile } = args

  const fileContent = await fs.readFile(file, `utf8`)
  const newFileContent = await fs.readFile(newFile, `utf8`)

  await fs.writeFile(file, newFileContent, `utf8`)

  history.set(file, fileContent)

  await writeHistory(history)
}

update()
