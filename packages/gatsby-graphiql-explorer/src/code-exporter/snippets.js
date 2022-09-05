export const removeQueryName = query =>
  query.replace(
    /^[^{(]+([{(])/,
    (_match, openingCurlyBracketsOrParenthesis) =>
      `query ${openingCurlyBracketsOrParenthesis}`
  )

const getQuery = (arg, spaceCount) => {
  const { operationDataList } = arg
  const { query } = operationDataList[0]
  const anonymousQuery = removeQueryName(query)
  return (
    ` `.repeat(spaceCount) +
    anonymousQuery.replace(/\n/g, `\n` + ` `.repeat(spaceCount))
  )
}

const pageQuery = {
  name: `Page Query`,
  language: `JavaScript`,
  codeMirrorMode: `jsx`,
  options: [],
  generate: arg => `import React from "react"
import { graphql } from "gatsby"

const Page = ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>

export const query = graphql\`
${getQuery(arg, 2)}
\`

export default Page

`,
}

const useStaticQuery = {
  name: `useStaticQuery`,
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

const snippets = [pageQuery, useStaticQuery, createPages]

export default snippets
