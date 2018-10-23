const _ = require(`lodash`)
const faker = require(`faker`)
const fs = require(`fs`)

let NUM_PAGES = 5000
if (process.env.NUM_PAGES) {
  NUM_PAGES = process.env.NUM_PAGES
}

let NUM_TYPES = 1
if (process.env.NUM_TYPES) {
  NUM_TYPES = process.env.NUM_TYPES
}

function newTypeName() {
  return _.capitalize(_.camelCase(faker.lorem.word()))
}

let types = []

exports.sourceNodes = ({ actions: { createNode } }) => {
  for (var i = 0; i < NUM_TYPES; i++) {
    types.push(newTypeName())
  }
  // Create markdown nodes
  const pagesPerType = NUM_PAGES / NUM_TYPES

  let step = 0

  _.forEach(types, typeName => {
    for (var i = 0; i < pagesPerType; i++) {
      step++
      createNode({
        id: step.toString(),
        parent: null,
        children: [],
        internal: {
          type: typeName,
          nestedId: step.toString(),
          content: faker.lorem.word(),
          contentDigest: step.toString(),
        },
      })
    }
  })
}

// Total hack. It would be nice if we could programatically generate
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
    </div>
  )
}

export const query = graphql\`
  query($id: String!) {
    ${lowerTypeName}(internal: { nestedId: { eq: $id } }) {
      id
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

async function createTypePages({ graphql, actions }, typeName) {
  const templateSrc = createPageTemplateJs(typeName)
  const templateFilename = `./.cache/${typeName}Template.js`
  fs.writeFileSync(templateFilename, templateSrc)
  let result = await graphql(allTypeQuery(typeName))
  _.forEach(result.data[`all${typeName}`].edges, edge => {
    const { node } = edge
    actions.createPage({
      path: `/${typeName}/${node.id}/`,
      component: require.resolve(templateFilename),
      context: {
        id: node.id,
      },
    })
  })
}

exports.createPages = async args => {
  _.forEach(types, typeName => {
    createTypePages(args, typeName)
  })
}
