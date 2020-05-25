import {
  queryPartsFromPath,
  generateQueryFromString,
} from "../collection-query-builder"

describe(`queryPartsFromPath`, () => {
  it(`creates valid graphql query parts from a file path descriptor`, () => {
    const path = `/foo/[bar]/baz/[foo__bar].js`

    expect(queryPartsFromPath(path)).toEqual(`bar,foo{bar}`)
  })
})

describe(`generateQueryFromString`, () => {
  it(`handles a single named item`, () => {
    expect(generateQueryFromString(`Product`, `id`)).toEqual(
      `{allProduct{nodes{id}}}`
    )
  })

  it(`handles a single named item prefixed by all`, () => {
    expect(generateQueryFromString(`allProduct`, `id`)).toEqual(
      `{allProduct{nodes{id}}}`
    )
  })

  it(`supports arguments`, () => {
    expect(
      generateQueryFromString(`allProduct(filter: {id: { eq: "bar" } })`, `id`)
    ).toEqual(`{allProduct(filter: {id: { eq: "bar" } }){nodes{id}}}`)
  })

  it.todo(
    `supports a fully stringed graphql query` /*, () => {
    expect(
      generateQueryFromString(
        `allProduct(filter: {id: { eq: "bar" } }) { nodes { id } }`,
        `id`
      )
    ).toEqual(`{allProduct(filter: {id: { eq: "bar" } }){nodes{id}}}`)
  }*/
  )
})
