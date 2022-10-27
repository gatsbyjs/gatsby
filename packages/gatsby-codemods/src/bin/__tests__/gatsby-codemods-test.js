let execaReturnValue

jest.setMock("execa", {
  node: () => execaReturnValue,
})

import process from "process"
import path from "path"
import fs from "fs"

const {
  runTransform,
  run,
  transformerDirectory,
  jscodeshiftExecutable,
} = require("../cli")

describe("transform", () => {
  it("finds transformer directory", () => {
    fs.lstatSync(transformerDirectory)
  })

  it("finds jscodeshift executable", () => {
    fs.lstatSync(jscodeshiftExecutable)
  })

  it("runs jscodeshift for the given transformer", () => {
    execaReturnValue = { error: null }
    console.log = jest.fn()
    runTransform(`gatsby-plugin-image`, `src`)

    expect(console.log).toBeCalledWith(
      `Executing command: jscodeshift --ignore-pattern=**/node_modules/** --ignore-pattern=**/.cache/** --ignore-pattern=**/public/** --extensions=jsx,js,ts,tsx --transform ${path.join(
        transformerDirectory,
        "gatsby-plugin-image.js"
      )} src`
    )
  })

  it("warns when on missing transform", () => {
    execaReturnValue = { error: null }
    console.log = jest.fn()
    process.argv = [`node`, `dir`]
    run()

    expect(console.log).toBeCalledWith(
      `Be sure to pass in the name of the codemod you're attempting to run.`
    )
  })

  it("warns when on missing target", () => {
    execaReturnValue = { error: null }
    console.log = jest.fn()
    process.argv = [`node`, `dir`, `gatsby-plugin-image`]
    run()

    expect(console.log).toBeCalledWith(
      `You have not provided a target directory to run the codemod against, will default to root.`
    )
  })

  it("warns when invalid transform", () => {
    execaReturnValue = { error: null }
    console.log = jest.fn()
    process.argv = [`node`, `dir`, `does-not-exist`]
    run()

    expect(console.log).toBeCalledWith(
      `You have passed in invalid codemod name: does-not-exist. Please pass in one of the following: gatsby-plugin-image, global-graphql-calls, import-link, navigate-calls, rename-bound-action-creators, sort-and-aggr-graphql.`
    )
  })
})
