import sysPath from "path"
import fs from "fs-extra"
import { collectionExtractQueryString } from "../collection-extract-query-string"
import reporter from "gatsby-cli/lib/reporter"

jest.mock(`gatsby-cli/lib/reporter`)

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

    expect(query).toMatchInlineSnapshot(`"{allProduct{nodes{name,id}}}"`)
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

    expect(query).toMatchInlineSnapshot(`"{allProduct{nodes{name,id}}}"`)
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

    expect(query).toMatchInlineSnapshot(`"{allProduct{nodes{name,id}}}"`)
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

    expect(query).toMatchInlineSnapshot(`"{allProduct{nodes{name,id}}}"`)
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

    expect(query).toMatchInlineSnapshot(`"{allProduct{nodes{name,id}}}"`)
  })

  it(`uses collectionGraphql if exported`, async () => {
    patchReadFileSync(`
      import { collectionGraphql } from "gatsby"
      export const collectionQuery = collectionGraphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { ...CollectionPagesQueryFragment } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Things.bar}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allThings(filter:{name:{nin:[\\"stuff\\"]}}){nodes{bar,id}}}"`
    )
  })

  it(`uses collectionGraphql if exported with prefix`, async () => {
    patchReadFileSync(`
      import { collectionGraphql } from "gatsby"
      export const collectionQuery = collectionGraphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { ...CollectionPagesQueryFragment } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/prefix-{Things.bar}`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allThings(filter:{name:{nin:[\\"stuff\\"]}}){nodes{bar,id}}}"`
    )
  })

  it(`uses collectionGraphql if exported with postfix`, async () => {
    patchReadFileSync(`
      import { collectionGraphql } from "gatsby"
      export const collectionQuery = collectionGraphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { ...CollectionPagesQueryFragment } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Things.bar}-postfix`),
      reporter
    )

    expect(query).toMatchInlineSnapshot(
      `"{allThings(filter:{name:{nin:[\\"stuff\\"]}}){nodes{bar,id}}}"`
    )
  })

  it(`reports an error if you forget the fragment`, async () => {
    patchReadFileSync(`
      import { collectionGraphql } from "gatsby"
      export const collectionQuery = collectionGraphql\`
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes { id } } }
      \`
      `)

    await collectionExtractQueryString(
      createPath(`src/pages/{Things.bar}`),
      reporter
    )

    expect(reporter.error).toBeCalled()
  })
})
