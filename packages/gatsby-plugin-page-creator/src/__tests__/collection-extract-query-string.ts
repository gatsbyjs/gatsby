import sysPath from "path"
import fs from "fs-extra"
import { collectionExtractQueryString } from "../collection-extract-query-string"
import reporter from "gatsby/reporter"

jest.mock(`gatsby/reporter`, () => {
  return {
    panicOnBuild: jest.fn(),
  }
})

// This makes the tests work on windows properly
const createPath = (path: string): string => path.replace(/\//g, sysPath.sep)

const originalReadFileSync = fs.readFileSync
const patchReadFileSync = (string: string): void => {
  // @ts-ignore
  fs.readFileSync = (): string => string
}

describe(`collectionExtractQueryString`, () => {
  afterEach(() => {
    fs.readFileSync = originalReadFileSync
  })
  it(`will create a basic query from the route`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Product.name}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query from the route with minimal length`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{P.n}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allP{nodes{n,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query from the route with a prefix variant 1`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/prefix-{Product.name}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query from the route with a prefix variant 2`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/prefix_{Product.name}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query from the route with a prefix variant 3`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/prefix{Product.name}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query from the route with a postfix`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Product.name}postfix`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query with multiple entries`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Product.name}-{Product.color}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,color,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query with multiple entries and different delimiters variant 1`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Product.name}_{Product.color}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,color,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query with multiple entries and different delimiters variant 1`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Product.name}.{Product.color}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,color,id,internal{contentFilePath}}}}"`
    )
  })

  it(`will create a basic query with multiple entries and different delimiters variant 1`, async () => {
    // @ts-ignore
    patchReadFileSync(`
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes, id } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Product.name}__{Product.color}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allProduct{nodes{name,color,id,internal{contentFilePath}}}}"`
    )
  })
})
