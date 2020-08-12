import sysPath from "path"
import fs from "fs-extra"
import { collectionExtractQueryString } from "../collection-extract-query-string"
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
      createPath(`src/pages/{Product.name}`)
    )

    expect(query).toMatchInlineSnapshot(`"{allProduct{nodes{name,id}}}"`)
  })

  it(`uses unstable_collectionGraphql if exported`, async () => {
    patchReadFileSync(`
      import { unstable_collectionGraphql } from "gatsby"
      export const collectionQuery = unstable_collectionGraphql\`  
        { allThings(filter: { name: { nin: ["stuff"] }}) { ...CollectionPagesQueryFragment } }
      \`
      `)

    const query = await collectionExtractQueryString(
      createPath(`src/pages/{Things.bar}`)
    )

    expect(query).toMatchInlineSnapshot(
      `"{allThings(filter:{name:{nin:[\\"stuff\\"]}}){nodes{bar,id}}}"`
    )
  })

  it(`throws an error if you forget the fragment`, async () => {
    patchReadFileSync(`
      import { unstable_collectionGraphql } from "gatsby"
      export const collectionQuery = unstable_collectionGraphql\`  
        { allThings(filter: { name: { nin: ["stuff"] }}) { nodes { id } } }
      \`
      `)

    expect(() =>
      collectionExtractQueryString(createPath(`src/pages/{Things.bar}`))
    ).toThrow()
  })
})
