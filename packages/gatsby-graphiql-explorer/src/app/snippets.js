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

const getDataNodeName = name =>
  name.startsWith(`all`) && name.length > 3
    ? name.substring(3, 4).toLowerCase() + name.substring(4, name.length)
    : null

const getFieldQuery = (root, enableComments) => {
  const rootName = root.name.value
  const dataNodeName = getDataNodeName(rootName)
  let nodes

  const comment = message => (enableComments ? `\n      // ${message}` : ``)

  if (root.selectionSet) {
    nodes = root.selectionSet.selections.find(
      selection => selection.name.value === `nodes`
    )

    if (nodes && nodes.selectionSet) {
      let hasId = false
      let hasSlug = false
      nodes.selectionSet.selections.forEach(field => {
        if (field.name.value === `id`) {
          hasId = true
        }
        if (field.name.value === `slug`) {
          hasSlug = true
        }
      })

      return `  result.data.${rootName}.${
        nodes.name.value
      }.forEach(${dataNodeName} => {
    createPage({${comment(`set URL of the page`)}
      path: ${
        hasSlug
          ? `\`/${dataNodeName}/\${${dataNodeName}.slug}/\``
          : `\`/${dataNodeName}/\${${dataNodeName}.uniquePathField}/\``
      },${comment(`set react template used to render page`)}
      component: path.resolve(\`./src/templates/${dataNodeName}.js\`),${comment(
        `provide variables that can be used in page query`
      )}
      context: {
        ${hasId ? `id: ${dataNodeName}.id,` : ``}
      },
    })
  })`
    }

    if (enableComments) {
      return `  // could not find field 'nodes' on ${rootName}\n  // this should probably be queried directly from a page by using the '${pageQuery.name}'`
    }
    return null
  }
}

const createPagesQuery = {
  name: `createPages`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [
    {
      id: `comments`,
      label: `Comments`,
      initial: false,
    },
  ],
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

${arg.operationDataList[0].operationDefinition.selectionSet.selections
  .map(selection => getFieldQuery(selection, arg.options.comments))
  .filter(fieldQuery => fieldQuery !== null)
  .join(`\n\n`)}
}

`,
}

export default [pageQuery, staticHook, staticQuery, createPagesQuery]
