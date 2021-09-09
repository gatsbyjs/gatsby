const getQuery = (arg, spaceCount) => {
  const { operationDataList } = arg
  const { query } = operationDataList[0]
  const anonymousQuery = query.replace(/query\s.+{/gim, `{`)
  return (
    ` `.repeat(spaceCount) +
    anonymousQuery.replace(/\n/g, `\n` + ` `.repeat(spaceCount))
  )
}

const pageQuery = {
  name: `Page query`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `import React from "react"
import { graphql } from "gatsby"

const ComponentName = ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>

export const query = graphql\`
${getQuery(arg, 2)}
\`

export default ComponentName

`,
}

const staticHook = {
  name: `StaticQuery hook`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `import React from "react"
import { useStaticQuery, graphql } from "gatsby"

const ComponentName = () => {
  const data = useStaticQuery(graphql\`
${getQuery(arg, 4)}
  \`)
  return <pre>{JSON.stringify(data, null, 4)}</pre>
}

export default ComponentName

`,
}

const staticQuery = {
  name: `StaticQuery`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `import React from "react"
import { StaticQuery, graphql } from "gatsby"

const ComponentName = () => (
  <StaticQuery
    query={graphql\`
${getQuery(arg, 6)}
    \`}
    render={data => <pre>{JSON.stringify(data, null, 4)}</pre>}
  ></StaticQuery>
)

export default ComponentName

`,
}

const createPages = {
  name: `createPages`,
  language: `JavaScript`,
  codeMirrorMode: `javascript`,
  options: [],
  generate: arg => `const path = require(\`path\`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(\`
${getQuery(arg, 4)}
  \`)
  const templatePath = path.resolve(\`PATH/TO/TEMPLATE.js\`)
  
  result.data.${
    arg.operationDataList[0].operationDefinition.selectionSet.selections[0].name
      .value
  }.forEach((node) => {
    createPage({
      path: NODE_SLUG,
      component: templatePath,
      context: {
        slug: NODE_SLUG,
      },
    })
  })
}
`,
}

export default [pageQuery, staticHook, staticQuery, createPages]
