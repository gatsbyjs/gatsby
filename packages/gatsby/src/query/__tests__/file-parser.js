jest.mock(`fs-extra`, () => {
  const fs = jest.requireActual(`fs-extra`)
  return {
    ...fs,
    readFile: jest.fn(),
  }
})
jest.mock(`../../utils/api-runner-node`, () => () => [])
jest.mock(`gatsby-cli/lib/reporter/index`)
const reporter = require(`gatsby-cli/lib/reporter`)
const fs = require(`fs-extra`)

const FileParser = require(`../file-parser`).default

const specialChars = `ж-ä-!@#$%^&*()_-=+:;'"?,~\``

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
    "static-query-hooks.js": `import { graphql, useStaticQuery } from 'gatsby'
export default () => {
  const data = useStaticQuery(graphql\`query StaticQueryName { foo }\`);
  return <div>{data.doo}</div>;
}`,
    "static-query-hooks-with-type-parameter.ts": `import { graphql, useStaticQuery } from 'gatsby'
export default () => {
  const data = useStaticQuery<HomepageQuery>(graphql\`query StaticQueryName { foo }\`);
  return <div>{data.doo}</div>;
}`,
    "static-query-hooks-missing-argument.js": `import { graphql, useStaticQuery } from 'gatsby'
export default () => {
  const data = useStaticQuery();
  return <div>{data.doo}</div>;
}`,
    "static-query-hooks-in-separate-variable.js": `import React from "react"
import { useStaticQuery, graphql } from "gatsby"

const query = graphql\`{ allMarkdownRemark { blah { node { cheese }}}}\`

export default () => {
  const data = useStaticQuery(query);
  return <div>{data.doo}</div>;
}`,
    "static-query-hooks-not-defined.js": `import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default () => {
  const data = useStaticQuery(strangeQueryName);
  return <div>{data.pizza}</div>;
}`,
    "static-query-hooks-imported.js": `import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import strangeQueryName from "./another-file.js"

export default () => {
  const data = useStaticQuery(strangeQueryName);
  return <div>{data.pizza}</div>;
}`,
    [`${specialChars}.js`]: `import { graphql, useStaticQuery } from 'gatsby'
export default () => {
  const data = useStaticQuery(graphql\`query { foo }\`);
  return <div>{data.doo}</div>;
}`,
    [`static-${specialChars}.js`]: `import { graphql } from 'gatsby'
  export default () => (
  <StaticQuery
    query={graphql\`query { foo }\`}
    render={data => <div>{data.doo}</div>}
  />
)`,
  }

  const parser = new FileParser()

  beforeAll(() => {
    fs.readFile.mockImplementation(file =>
      Promise.resolve(MOCK_FILE_INFO[file])
    )
  })

  it(`extracts query AST correctly from files`, async () => {
    const results = await parser.parseFiles(
      Object.keys(MOCK_FILE_INFO),
      jest.fn()
    )
    expect(results).toMatchSnapshot()
    expect(reporter.warn).toMatchSnapshot()
  })

  it(`generates spec-compliant query names out of path`, async () => {
    const ast = await parser.parseFile(`${specialChars}.js`, jest.fn())
    const nameNode = ast.definitions[0].name
    expect(nameNode).toEqual({
      kind: `Name`,
      value: `zhADollarpercentandJs1646962495`,
    })

    const ast2 = await parser.parseFile(`static-${specialChars}.js`, jest.fn())
    const nameNode2 = ast2.definitions[0].name
    expect(nameNode2).toEqual({
      kind: `Name`,
      value: `staticZhADollarpercentandJs1646962495`,
    })
  })
})
