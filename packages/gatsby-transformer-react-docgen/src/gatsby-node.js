const {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)
const path = require(`path`)
const crypto = require(`crypto`)
const GraphQLJSON = require(`graphql-type-json`)
const metadata = require(`react-docgen`)

const { parseDoclets, applyPropDoclets } = require(`./Doclets`)

const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)

function resolve(field) {
  return obj => JSON.parse(obj.content)[field]
}

const descId = parent => `${parent.id}--ComponentMetadataDescription`

function createMarkdownNode(node, boundActionCreators) {
  if (!node.description) return
  const { createNode, updateNode } = boundActionCreators

  const markdownNode = {
    id: descId(node),
    type: `MarkdownRemark`,
    mediaType: `text/x-markdown`,
    parent: node.id,
    content: node.description,
    contentDigest: digest(node.description),
    children: [],
  }
  node.children = node.children.concat([markdownNode.id])
  updateNode(node)
  createNode(markdownNode)
}

exports.onNodeCreate = function onNodeCreate({
  node,
  loadNodeContent,
  boundActionCreators,
}) {
  const { createNode, updateNode } = boundActionCreators

  if (node.type === `ComponentMetadata`) {
    if (!node.children.length) createMarkdownNode(node, boundActionCreators)
    return null
  }

  if (node.mediaType !== `application/javascript`) return null

  return loadNodeContent(node)
    .then(content => {
      const filePath = node.absolutePath
      const component = metadata.parse(content)

      component.id = filePath
      component.name = path.basename(filePath, path.extname(filePath))

      parseDoclets(component)
      component.props = Object.keys(component.props || {}).map(propName => {
        const prop = component.props[propName]
        prop.name = propName
        parseDoclets(prop, propName)
        applyPropDoclets(prop)
        return prop
      })

      const strContent = JSON.stringify(component)
      const nodeId = `${node.id}--${component.id}--ComponentMetadata`

      const metadataNode = {
        id: nodeId,
        content: strContent,
        contentDigest: digest(strContent),
        parent: node.id,
        type: `ComponentMetadata`,
        mediaType: `text/x-react-metadata`,
        children: [],
        name: component.name,
        description: component.description,
        absolutePath: node.absolutePath,
      }
      console.log(`heherer`)
      node.children = node.children.concat([metadataNode.id])
      updateNode(node)
      createNode(metadataNode)
    })
    .catch(err => console.log(err))
}

const PropDefaultValue = new GraphQLObjectType({
  name: `PropDefaultValue`,
  fields: () => ({
    value: { type: GraphQLJSON },
    computed: { type: GraphQLBoolean },
  }),
})

const Prop = new GraphQLObjectType({
  name: `ComponentProps`,
  fields: () => ({
    name: { type: GraphQLString },
    html: { type: GraphQLString },
    description: { type: GraphQLString },
    doclets: { type: GraphQLJSON },
    defaultValue: { type: PropDefaultValue },
    required: { type: GraphQLBoolean },
    type: { type: GraphQLJSON },
  }),
})

const Method = new GraphQLObjectType({
  name: `ComponentMethod`,
  fields: () => ({
    name: { type: GraphQLString },
    docblock: { type: GraphQLString },
    modifiers: { type: new GraphQLList(GraphQLJSON) },
    params: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: `ComponentMethodParams`,
          fields: () => ({
            name: { type: GraphQLString },
            type: { type: GraphQLJSON },
          }),
        })
      ),
    },
    returns: { type: new GraphQLList(GraphQLJSON) },
  }),
})

exports.extendNodeType = ({ type }) => {
  if (type.name !== `ComponentMetadata`) return {}

  return {
    doclets: {
      type: GraphQLJSON,
      resolve: resolve(`doclets`),
    },
    composes: {
      type: new GraphQLList(GraphQLString),
      resolve: resolve(`composes`),
    },
    methods: {
      type: new GraphQLList(Method),
      resolve: resolve(`methods`),
    },
    props: {
      type: new GraphQLList(Prop),
      resolve: obj => {
        return resolve(`props`)(obj)
      },
    },
  }
}
