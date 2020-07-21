import sysPath from "path"
// This makes the tests work on windows properly
const createPath = (path: string): string => path.replace(/\//, sysPath.sep)

describe(`collectionExtractQueryString`, () => {
  beforeEach(jest.resetModules)

  it(`will create a basic query from the route`, async () => {
    jest.mock(`fs-extra`, () => {
      return {
        readFileSync: (): string => `
      import { graphql } from "gatsby"
      export const pageQuery = graphql\`  
        { allThings(filter: { name: { nin: ["stuff"] }}) { ...CollectionPagesQueryFragment } }
      \`
      `,
      }
    })
    const {
      collectionExtractQueryString,
    } = require(`../collection-extract-query-string`)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Product.name}`)
    )

    expect(query).toMatchInlineSnapshot(`"{allProduct{nodes{name,id}}}"`)
  })

  it(`uses unstable_collectionQuery if exported`, async () => {
    jest.mock(`fs-extra`, () => {
      return {
        readFileSync: (): string => `
      import { unstable_collectionGraphql } from "gatsby"
      export const collectionQuery = unstable_collectionGraphql\`  
        { allThings(filter: { name: { nin: ["stuff"] }}) { ...CollectionPagesQueryFragment } }
      \`
      `,
      }
    })
    const {
      collectionExtractQueryString,
    } = require(`../collection-extract-query-string`)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Things.bar}`)
    )

    expect(query).toMatchInlineSnapshot(
      `"{allThings(filter:{name:{nin:[\\"stuff\\"]}}){nodes{bar,id}}}"`
    )
  })

  it(`throws an error if you forget the fragment`, async () => {
    jest.mock(`fs-extra`, () => {
      return {
        readFileSync: (): string => `
      import { unstable_collectionGraphql } from "gatsby"
      export const collectionQuery = unstable_collectionGraphql\`  
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes { id } } }
      \`
      `,
      }
    })
    const {
      collectionExtractQueryString,
    } = require(`../collection-extract-query-string`)

    expect(() =>
      collectionExtractQueryString(createPath(`src/pages/{Things.bar}`))
    ).toThrow()
  })
})
