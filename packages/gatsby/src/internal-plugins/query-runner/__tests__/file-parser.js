jest.mock(`fs-extra`, () => {
  let mockFiles = {}
  return {
    __setMockFiles: newMockFiles => {
      mockFiles = Object.assign({}, newMockFiles)
    },
    readFile: (filePath, parser) =>
      new Promise(resolve => resolve(mockFiles[filePath])),
  }
})
jest.mock(`../../../utils/api-runner-node`, () => () => [])

const FileParser = require(`../file-parser`).default

describe(`File parser`, () => {
  const MOCK_FILE_INFO = {
    "no-query.js": `import React from "react"`,
    "page-query.js": `export const query = graphql\`
query PageQueryName {
  foo
}
\``,
    "page-query-no-name.js": `export const query = graphql\`
query {
  foo
}
\``,
    "static-query.js": `export default () => (
  <StaticQuery
    query={graphql\`query StaticQueryName { foo }\`}
    render={data => <div>{data.doo}</div>}
  />
)`,
    "static-query-no-name.js": `export default () => (
  <StaticQuery
    query={graphql\`{ foo }\`}
    render={data => <div>{data.foo}</div>}
  />
)`,
    "static-query-named-export.js": `export const Component = () => (
  <StaticQuery
    query={graphql\`query StaticQueryName { foo }\`}
    render={data => <div>{data.doo}</div>}
  />
)`,
    "static-query-closing-tag.js": `export default () => (
  <StaticQuery
    query={graphql\`{ foo }\`}
  >
    {data => <div>{data.foo}</div>}
  </StaticQuery>
)`,
    "page-query-and-static-query-named-export.js": `export const Component = () => (
  <StaticQuery
    query={graphql\`query StaticQueryName { foo }\`}
    render={data => <div>{data.doo}</div>}
  />
)
export const pageQuery = graphql\`query PageQueryName { foo }\`
`,
    "multiple-fragment-exports.js": `export const fragment1 = graphql\`
  fragment Fragment1 on RootQueryField {
    foo
  }
  fragment Fragment2 on RootQueryField {
    bar
  }
\`
export const fragment3 = graphql\`
  fragment Fragment3 on RootQueryField {
    baz
  }
\`
`,
  }

  const parser = new FileParser()

  beforeAll(() => {
    require(`fs-extra`).__setMockFiles(MOCK_FILE_INFO)
  })

  it(`extracts query AST correctly from files`, async () => {
    const results = await parser.parseFiles(Object.keys(MOCK_FILE_INFO))
    expect(results).toMatchSnapshot()
  })
})
