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
    "page-query.js": `import { graphql } from 'gatsby'
    export const query = graphql\`
query PageQueryName {
  foo
}
\``,
    "page-query-no-name.js": `import { graphql } from 'gatsby'
  export const query = graphql\`
query {
  foo
}
\``,
    "static-query.js": `import { graphql } from 'gatsby'
  export default () => (
  <StaticQuery
    query={graphql\`query StaticQueryName { foo }\`}
    render={data => <div>{data.doo}</div>}
  />
)`,
    "static-query-no-name.js": `import { graphql } from 'gatsby'
  export default () => (
  <StaticQuery
    query={graphql\`{ foo }\`}
    render={data => <div>{data.foo}</div>}
  />
)`,
    "static-query-named-export.js": `import { graphql } from 'gatsby'
  export const Component = () => (
  <StaticQuery
    query={graphql\`query StaticQueryName { foo }\`}
    render={data => <div>{data.doo}</div>}
  />
)`,
    "static-query-closing-tag.js": `import { graphql } from 'gatsby'
  export default () => (
  <StaticQuery
    query={graphql\`{ foo }\`}
  >
    {data => <div>{data.foo}</div>}
  </StaticQuery>
)`,
    "page-query-and-static-query-named-export.js": `import { graphql } from 'gatsby'
  export const Component = () => (
  <StaticQuery
    query={graphql\`query StaticQueryName { foo }\`}
    render={data => <div>{data.doo}</div>}
  />
)
export const pageQuery = graphql\`query PageQueryName { foo }\`
`,
    "multiple-fragment-exports.js": `import { graphql } from 'gatsby'
  export const fragment1 = graphql\`
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
    "fragment-shorthand.js": `import React from "react"
import { StaticQuery, graphql } from "gatsby"

const query = graphql\`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
\`

export default () => (
  <>
    <StaticQuery
      query={query}
      render={data => <div>{data.title}</div>}
    />
  </>
)`,
    "query-in-separate-variable.js": `import React from "react"
import { StaticQuery, graphql } from "gatsby"

const query = graphql\`{ allMarkdownRemark { blah { node { cheese }}}}\`

export default () => (
  <StaticQuery
    query={query}
    render={data => <div>{data.pizza}</div>}
  />
)`,
    "query-in-separate-variable-2.js": `import React from "react"
import { StaticQuery, graphql } from "gatsby"

const query = graphql\`{ fakeOut { blah { node { cheese }}}}\`
const strangeQueryName = graphql\`{ allStrangeQueryName { blah { node { cheese }}}}\`

export default () => (
  <StaticQuery
    query={strangeQueryName}
    render={data => <div>{data.pizza}</div>}
  />
)`,
    "query-not-defined.js": `import React from "react"
import { StaticQuery, graphql } from "gatsby"

export default () => (
  <StaticQuery
    query={strangeQueryName}
    render={data => <div>{data.pizza}</div>}
  />
)`,
    "query-imported.js": `import React from "react"
import { StaticQuery, graphql } from "gatsby"
import strangeQueryName from "./another-file.js"

export default () => (
  <StaticQuery
    query={strangeQueryName}
    render={data => <div>{data.pizza}</div>}
  />
)`,
  }

  const parser = new FileParser()

  beforeAll(() => {
    require(`fs-extra`).__setMockFiles(MOCK_FILE_INFO)
  })

  it(`extracts query AST correctly from files`, async () => {
    const spyStderr = jest.spyOn(process.stderr, `write`)
    const results = await parser.parseFiles(Object.keys(MOCK_FILE_INFO))
    expect(results).toMatchSnapshot()
    expect(
      spyStderr.mock.calls
        .filter(c => c[0].includes(`warning`))
        // Remove console colors + trim whitespace
        // eslint-disable-next-line
        .map(c => c[0].replace(/\x1B[[(?);]{0,2}(;?\d)*./g, ``).trim())
    ).toMatchSnapshot()
    spyStderr.mockRestore()
  })
})
