/* @flow */
import fs from "fs"

import buildCSS from "./build-css"
import buildHTML from "./build-html"
import buildProductionBundle from "./build-javascript"
import bootstrap from "../bootstrap"
import apiRunnerNode from "./api-runner-node"
const { store } = require(`../redux`)

async function html(program: any) {
  const { graphqlRunner } = await bootstrap(program)

  console.log(`Generating CSS`)
  await buildCSS(program).catch(err => {
    console.log(``)
    console.log(`Generating CSS failed`, err)
    console.log(``)
    console.log(err)
    process.exit(1)
  })

  console.log(`Compiling production bundle.js`)
  await buildProductionBundle(program).catch(err => {
    console.log(``)
    console.log(`Generating JS failed`, err)
    console.log(``)
    console.log(err)
    process.exit(1)
  })

  console.log(`Generating Static HTML`)
  // Write out pages data to file so it's available to the static-entry.js
  // file.
  fs.writeFileSync(
    `${program.directory}/public/tmp-pages.json`,
    JSON.stringify(store.getState().pages)
  )
  await buildHTML(program).catch(err => {
    console.log(``)
    console.log(`Generating HTML failed`)
    console.log(``)
    console.log(err)
    process.exit(1)
  })

  console.log(`Running postBuild plugins`)
  await apiRunnerNode(`postBuild`, { graphql: graphqlRunner })
}

module.exports = html
