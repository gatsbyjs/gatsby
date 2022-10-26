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
  .option(`copy`, {
    default: undefined,
    type: `string`,
  })
  .option(`exact`, {
    default: false,
    type: `boolean`,
  })
  .option(`delete`, {
    default: false,
    type: `boolean`,
  })
  .option(`fileContent`, {
    default: JSON.stringify(
      `
    import * as React from 'react';
    
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
  })
  .option(`fileSource`, {
    type: `string`,
  })
  .option(`restore`, {
    default: false,
    type: `boolean`,
  }).argv

async function update() {
  const history = await getHistory()

  const { file: fileArg, replacements, restore, copy } = args
  const filePath = path.resolve(fileArg)
  if (restore) {
    const original = history.get(filePath)
    if (original) {
      await fs.writeFile(filePath, original, `utf-8`)
    } else if (original === false) {
      await fs.remove(filePath)
    } else {
      console.log(`Didn't make changes to "${fileArg}". Nothing to restore.`)
    }
    history.delete(filePath)
    return
  }
  let exists = true
  if (!fs.existsSync(filePath)) {
    exists = false
    let fileContent
    if (args.fileSource) {
      fileContent = await fs.readFile(args.fileSource, `utf8`)
    } else if (args.fileContent) {
      fileContent = JSON.parse(args.fileContent).replace(/\+n/g, `\n`)
    }
    await fs.writeFile(filePath, fileContent, `utf8`)
  }
  const file = await fs.readFile(filePath, `utf8`)

  if (!history.has(filePath)) {
    history.set(filePath, exists ? file : false)
  }

  if (args.delete) {
    if (exists) {
      await fs.remove(filePath)
    }
  } else if(args.copy) {
    const copyFileContent = await fs.readFile(args.copy)
    await fs.writeFile(filePath, copyFileContent)
  } else {
    const contents = replacements.reduce((replaced, pair) => {
      const [key, value] = pair.split(`:`)
      return replaced.replace(
        args.exact ? key : new RegExp(`%${key}%`, `g`),
        value
      )
    }, file)

    await fs.writeFile(filePath, contents, `utf8`)
  }

  await writeHistory(history)
}

update()
