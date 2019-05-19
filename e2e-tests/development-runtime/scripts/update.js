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
    default: [],
    type: `array`,
  })
  .option(`exact`, {
    default: false,
    type: `boolean`,
  })
  .option(`fileContent`, {
    default: JSON.stringify(
      `
    import React from 'react';
    
    import Layout from '../components/layout';
    
    export default function SomeComponent() {
      return (
        <Layout>
          <h1 data-testid="message">Hello %REPLACEMENT%</h1>
        </Layout>
      )
    }
    `
    ).trim(),
    type: `string`,
  }).argv

async function update() {
  const history = await getHistory()

  const { file: fileArg, replacements } = args
  const filePath = path.resolve(fileArg)
  let exists = true
  if (!fs.existsSync(filePath)) {
    exists = false
    await fs.writeFile(
      filePath,
      JSON.parse(args.fileContent).replace(/\+n/g, `\n`),
      `utf8`
    )
  }
  let file = await fs.readFile(filePath, `utf8`)

  if (!history.has(filePath)) {
    history.set(filePath, exists ? file : false)
  }

  const contents = replacements.reduce((replaced, pair) => {
    const [key, value] = pair.split(`:`)
    return replaced.replace(
      args.exact ? key : new RegExp(`%${key}%`, `g`),
      value
    )
  }, file)

  await fs.writeFile(filePath, contents, `utf8`)

  await writeHistory(history)
}

update()
