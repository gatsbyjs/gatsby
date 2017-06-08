/* @flow */
import fs from "fs"

import buildCSS from "./build-css"
import buildHTML from "./build-html"
import buildProductionBundle from "./build-javascript"
import bootstrap from "../bootstrap"
import apiRunnerNode from "./api-runner-node"
const { store } = require(`../redux`)
const copyStaticDirectory = require(`./copy-static-directory`)
const { stripIndent } = require(`common-tags`)

async function html(program: any) {
  const { graphqlRunner } = await bootstrap(program)
  // Copy files from the static directory to
  // an equivalent static directory within public.
  copyStaticDirectory()

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

  console.log(`Generating static HTML for pages`)
  await buildHTML(program).catch(err => {
    console.log(``)
    console.log(err)
    console.log(``)
    console.log(`Generating static HTML for pages failed`)
    console.log(
      `See our docs page on debugging HTML builds for help https://goo.gl/yL9lND`
    )

    process.exit(1)
  })

  await apiRunnerNode(`onPostBuild`, { graphql: graphqlRunner })
}

module.exports = html
