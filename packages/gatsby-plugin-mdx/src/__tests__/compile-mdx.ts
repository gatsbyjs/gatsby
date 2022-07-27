/**
 * @jest-environment node
 */

import { readFileSync } from "fs"
import path from "path"

import { NodePluginArgs } from "gatsby"

import { compileMDX, compileMDXWithCustomOptions } from "../compile-mdx"

const exampleMdxPath = path.resolve(
  __dirname,
  `..`,
  `__fixtures__`,
  `example.mdx`
)
const exampleMdxContent = readFileSync(exampleMdxPath)

const cache = {
  directory: __dirname,
} as unknown as NodePluginArgs["cache"]

const reporter = {
  info: jest.fn(),
  verbose: jest.fn(),
  warn: jest.fn(),
  panic: jest.fn(e => {
    throw e
  }),
  panicOnBuild: jest.fn(e => {
    throw e
  }),
} as unknown as NodePluginArgs["reporter"]

describe(`compiles MDX`, () => {
  it(`default`, async () => {
    console.log(exampleMdxContent.toString())
    try {
      await compileMDX(
        { absolutePath: exampleMdxPath, source: exampleMdxContent.toString() },
        {},
        cache,
        reporter
      )
    } catch (err) {
      console.dir(err)
      console.error(err)
    }
    // await expect(
    //   compileMDX(
    //     { absolutePath: exampleMdxPath, source: exampleMdxContent.toString() },
    //     {},
    //     cache,
    //     reporter
    //   )
    // ).resolves.toMatchInlineSnapshot()
  })
})
