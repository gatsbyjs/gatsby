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

export default ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>

export const query = graphql\`
${getQuery(arg, 2)}
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
${getQuery(arg, 4)}
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
${getQuery(arg, 6)}
    \`}
    render={data => <pre>{JSON.stringify(data, null, 4)}</pre>}
  ></StaticQuery>
)

`,
}

const createPagesQuery = {
  name: `createPages`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `const path = require(\`path\`)
  
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const result = await graphql(\`
${getQuery(arg, 4)}
  \`)

  if (result.errors) {
    reporter.panicOnBuild(
      \`There was error while executing query in gatsby-node.js:\\n\\n\${result.errors
        .map(e => e.toString())
        .join(\`\\n\\n\`)}\`
    )
    return
  }

  // Use result.data to create pages, snippet below is sample that need to be adjusted for shape of your query
  result.data.allData.nodes.forEach(dataNode => {
    createPage({
      // set URL of the page
      path: \`/my/url/\${dataNode.slug}\`,
      // set react template used to render page
      component: path.resolve(\`./src/templates/my-template.js\`),
      // provide variables that can be used in page query to
      // select node - id is great choice as it is unique
      context: {
        id: dataNode.id,
      },
    })
  })
}

`,
}

export default [pageQuery, staticHook, staticQuery, createPagesQuery]
