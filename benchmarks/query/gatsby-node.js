const _ = require(`lodash`)
const faker = require(`faker`)
const fs = require(`fs`)

const NUM_PAGES = parseInt(process.env.NUM_PAGES || 5000, 10)

const NUM_TYPES = parseInt(process.env.NUM_TYPES || 10, 10)

function newTypeName() {
  return _.capitalize(_.camelCase(faker.lorem.word()))
}

let types = []
for (let i = 0; i < NUM_TYPES; i++) {
  types.push(newTypeName())
}
// Create markdown nodes
const pagesPerType = NUM_PAGES / NUM_TYPES

const links = types.reduce((links, typeName) => {
  links[`${typeName}___NODE`] = Array.from(Array(pagesPerType).keys()).map(
    step => `${typeName}${step.toString()}`
  )
  return links
}, {})

const linkedNodesQueryFields = `links { 
  ${types
    .map(
      typeName => `${typeName} {
    internal {
      content
    }
  }`
    )
    .join(`\n`)}
}`

// Create NUM_PAGES nodes, split over NUM_TYPES types. Each node has
// the bare minimum of content
exports.sourceNodes = ({ actions: { createNode } }) => {
  let step = 0
  _.forEach(types, typeName => {
    for (let i = 0; i < pagesPerType; i++) {
      step++
      const id = `${typeName}${i.toString()}`
      const node = {
        id,
        parent: null,
        children: [],
        nestedId: id,
        links,
        internal: {
          type: typeName,
          content: faker.lorem.word(),
          contentDigest: step.toString(),
        },
      }

      createNode(node)
    }
  })
}

// Total hack. It would be nice if we could programmatically generate
// graphQL per component. But in the meantime, we just generate the
// actual component js file with the graphql
function createPageTemplateJs(typeName) {
  const lowerTypeName = _.lowerFirst(typeName)
  return `
import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  const node = data["${lowerTypeName}"]
  return (
    <div>
      <h1>{node.id}. Not much ey</h1>
      <pre>
        {JSON.stringify(node, null, 2)}
      </pre>
    </div>
  )
}

export const query = graphql\`
  query($id: String!) {
    ${lowerTypeName}(nestedId: { eq: $id }) {
      id
      ${process.env.QUERY_LINKED_NODES ? linkedNodesQueryFields : ``}
    }
  }
\`
`
}

function allTypeQuery(typeName) {
  return `
{
  all${typeName}(sort: { fields: [id] }) {
    edges {
      node {
        id
      }
    }
  }
}
`
}

// Create template in .cache for the received type
function createTemplateFile(typeName) {
  const templateSrc = createPageTemplateJs(typeName)
  const templateFilename = `./.cache/${typeName}Template.js`
  fs.writeFileSync(templateFilename, templateSrc)
  return templateFilename
}

// Create node for the received type
async function createNode(graphql, typeName) {
  const result = await graphql(allTypeQuery(typeName))
  return result.data[`all${typeName}`].edges
}

// Create page for each type
exports.createPages = async ({ actions, graphql }) => {
  for (let i = 0; i < types.length; i++) {
    const typeName = types[i]
    const templateFilename = createTemplateFile(typeName)
    const edges = await createNode(graphql, typeName)
    _.forEach(edges, ({ node }) => {
      actions.createPage({
        path: `/${typeName}/${node.id}/`,
        component: require.resolve(templateFilename),
        context: {
          id: node.id,
          useQueryIndex: true,
        },
      })
    })
  }
}
