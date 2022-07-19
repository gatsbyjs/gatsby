import { removeQueryName } from "../snippets"
import { stripIndent } from "common-tags"

describe(`removeQueryName`, () => {
  function getFullQuery(startOfQuery) {
    return `${startOfQuery}
  allMarkdownRemark {
    nodes {
      excerpt
    }
  }
}`
  }

  it(`{`, () => {
    const startOfQuery = `{`
    expect(removeQueryName(getFullQuery(startOfQuery))).toMatchInlineSnapshot(`
      "{
        allMarkdownRemark {
          nodes {
            excerpt
          }
        }
      }"
    `)
  })

  it(`query {`, () => {
    const startOfQuery = `query {`
    expect(removeQueryName(getFullQuery(startOfQuery))).toMatchInlineSnapshot(`
      "query {
        allMarkdownRemark {
          nodes {
            excerpt
          }
        }
      }"
    `)
  })

  it(`query NameOfTheQuery {`, () => {
    const startOfQuery = `query NameOfTheQuery {`
    expect(removeQueryName(getFullQuery(startOfQuery))).toMatchInlineSnapshot(`
      "query {
        allMarkdownRemark {
          nodes {
            excerpt
          }
        }
      }"
    `)
  })

  it(`query ($args: String) {`, () => {
    const startOfQuery = `query ($args: String) {`
    expect(removeQueryName(getFullQuery(startOfQuery))).toMatchInlineSnapshot(`
      "query ($args: String) {
        allMarkdownRemark {
          nodes {
            excerpt
          }
        }
      }"
    `)
  })

  it(`query NameOfTheQuery ($args: String) {`, () => {
    const startOfQuery = `query NameOfTheQuery ($args: String) {`
    expect(removeQueryName(getFullQuery(startOfQuery))).toMatchInlineSnapshot(`
      "query ($args: String) {
        allMarkdownRemark {
          nodes {
            excerpt
          }
        }
      }"
    `)
  })
})
