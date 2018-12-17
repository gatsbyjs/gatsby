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
  }).argv

const getFileContent = name =>
  `
import React from 'react';

import Layout from '../components/layout';

export default function ${name.substr(0, 1).toUpperCase()}${name.slice(1)}() {
  return (
    <Layout>
      <h1 data-testid="message">Hello %${name.toUpperCase()}_REPLACEMENT%</h1>
    </Layout>
  )
}
`.trim()

async function update() {
  const history = await getHistory()

  const { file: fileArg, replacements } = args
  const filePath = path.resolve(fileArg)
  let exists = true
  if (!fs.existsSync(filePath)) {
    const name = path
      .basename(filePath)
      .split(/\..+$/)
      .shift()
    exists = false
    await fs.writeFile(filePath, getFileContent(name), `utf8`)
  }
  let file = await fs.readFile(filePath, `utf8`)

  if (!history.has(filePath)) {
    history.set(filePath, exists ? file : false)
  }

  const contents = replacements.reduce((replaced, pair) => {
    const [key, value] = pair.split(`:`)
    return replaced.replace(new RegExp(`%${key}%`, `g`), value)
  }, file)

  await fs.writeFile(filePath, contents, `utf8`)

  await writeHistory(history)
}

update()
