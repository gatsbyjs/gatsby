/* @flow weak */
import toml from "toml"
import fs from "fs"
import os from "os"
import _ from "lodash"

import buildCSS from "./build-css"
import buildHTML from "./build-html"
import buildProductionBundle from "./build-javascript"
import postBuild from "./post-build"
import bootstrap from "../bootstrap"
import apiRunnerNode from "./api-runner-node"
import { pagesDB } from "./globals"

async function html (program) {
  const directory = program.directory
  const { graphqlRunner } = await bootstrap(program)

  console.log(`Generating CSS`)
  await buildCSS(program).catch(err =>
    console.log(`Generating CSS failed`, err))

  console.log(`Compiling production bundle.js`)
  await buildProductionBundle(program).catch(err =>
    console.log(`Generating JS failed`, err))

  console.log(`Generating Static HTML`)
  // Write out pages data to file so it's available to the static-entry.js
  // file.
  fs.writeFileSync(
    `${program.directory}/public/tmp-pages.json`,
    JSON.stringify([...pagesDB().values()])
  )
  await buildHTML(program).catch(err =>
    console.log(`Generating HTML failed`, err))

  console.log(`Running postBuild plugins`)
  await apiRunnerNode(`postBuild`, { graphql: graphqlRunner })

  return
}

module.exports = html
