import { pullNodesPathFromQuery } from "../pull-nodes-path-from-query"

describe(`pullNodesPathFromQuery`, () => {
  it(`works on a basic query`, () => {
    expect(pullNodesPathFromQuery(`{allData{nodes{id}}}`)).toBe(`allData.nodes`)
  })

  it(`works on a group basic query`, () => {
    expect(
      pullNodesPathFromQuery(`{allMarkdownRemark {
        group(field: frontmatter___topic) {
            nodes {frontmatter{topic}}
        }
    }}`)
    ).toBe(`allMarkdownRemark.group.nodes`)
  })
})
