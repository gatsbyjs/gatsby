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

  console.log(`Generating Static HTML`)
  await buildHTML(program).catch(err => {
    console.log(``)
    console.log(err)
    console.log(``)
    console.log(`Generating HTML failed`)
    console.log(stripIndent`
      Errors while building static HTML files generally happen for two reasons.

      1. Some of your code references "browser globals" like window or
      document.  If this is your problem you should see an error above like
      "window is not defined".  To fix this, find the offending code and either
      a) check before calling the code if window is defined so the code doesn't
      run while gatsby is building or b) if the code is in the render function
      of a React.js component, move that code into "componentDidMount" which
      ensures the code doesn't run unless it's in the browser.

      2. Some other reason :-) #1 is the most common reason building static
      files fail. If it's another reason, you have to be a bit more creative in
      figuring out the problem.

      If you look above at the stack trace, you'll see that all the file names
      point to the same file, "render-page.js". What is this? This is the
      JavaScript bundle that Gatsby creates for rendering HTML. It takes all
      the code and data for your site and puts it in big bundle and then uses
      that to generate all the HTML.

      Normally Gatsby deletes the file after building HTML is finished so you'd
      never see it. But since the build failed, it's still around and you can
      use it to help debug why your build failed.

      So let's open the file and dive in.

      The "render-page.js" file is in the "public" directory in your site
      directory. Open it up and then navigate to the line number listed in the
      first stack trace.  So if that line says something like:

      ReferenceError: window is not defined at Object.render
      (render-page.js:53450:6)

      Then go to line #53450

      Here it gets a bit tricky. Once at that line, you'll need to figure out
      where in your codebase the code is from. Sometimes it's your own code and
      that's easy. But other times, the offending code is from a module that
      you or worse 😱, a module many requires away from your code in some
      obscure module.

      In this worst case scenario, you can either grep node_modules for the
      code or you can start back tracking up the stack trace (i.e. go to line
      number in the next referenced line) until you find code you recognize and
      work from there.
    `)
    process.exit(1)
  })

  await apiRunnerNode(`onPostBuild`, { graphql: graphqlRunner })
}

module.exports = html
