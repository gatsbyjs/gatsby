const getQuery = arg => {
  const { operationDataList } = arg
  const { query } = operationDataList[0]
  return query
}

const pageQuery = {
  name: `Page query`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>

export const query = graphql\`
${getQuery(arg)}
\`
`,
}

const staticHook = {
  name: `StaticQuery hook`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default () => {
const data = useStaticQuery(graphql\`
  ${getQuery(arg)}
\`)
return <pre>{JSON.stringify(data, null, 4)}</pre>
}
`,
}

const staticQuery = {
  name: `StaticQuery`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `import React from "react"
import { StaticQuery, graphql } from "gatsby"

export default () => (
  <StaticQuery
    query={graphql\`
      ${getQuery(arg)}
    \`}
    render={data => <pre>{JSON.stringify(data, null, 4)}</pre>}
  ></StaticQuery>
)
`,
}

export default [pageQuery, staticHook, staticQuery]
