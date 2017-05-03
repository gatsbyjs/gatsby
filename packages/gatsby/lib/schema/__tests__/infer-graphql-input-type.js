const _ = require(`lodash`)
const runSift = require(`../run-sift`)
const {
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} = require(`graphql-skip-limit`)
const buildConnectionFields = require(`../build-connection-fields`)

describe(`GraphQL Input args`, () => {
  const { inferObjectStructureFromNodes } = require(`../infer-graphql-type`)
  const {
    inferInputObjectStructureFromNodes,
  } = require(`../infer-graphql-input-fields`)
  const { graphql, GraphQLObjectType, GraphQLSchema } = require(`graphql`)
  const nodes = [
    {
      name: `The Mad Max`,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [1, 2, 3, 4],
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
      anObjectArray: [
        { aString: `some string`, aNumber: 2, aBoolean: true },
        { aString: `some string`, aNumber: 2, anArray: [1, 2] },
      ],
    },
    {
      name: `The Mad Wax`,
      hair: 2,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [1, 2, 5, 4],
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
      },
    },
  ]
  const inferredFields = inferObjectStructureFromNodes({ nodes })
  const inferredInputFields = inferInputObjectStructureFromNodes(
    nodes,
    ``,
    `test`
  )
  const nodeType = new GraphQLObjectType({
    name: `Test`,
    fields: { ...inferredFields },
  })

  const { connectionType: nodeConnection } = connectionDefinitions({
    nodeType,
    connectionFields: () =>
      buildConnectionFields({
        name: `Test`,
        nodes,
        nodeObjectType: nodeType,
      }),
  })

  const connection = {
    name: `nodeConnection`,
    type: nodeConnection,
    args: {
      ...connectionArgs,
      ...inferredInputFields,
    },
    resolve(nvi, args) {
      return runSift({
        args,
        nodes,
        connection: true,
      })
    },
  }

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        allNode: connection,
      }),
    }),
  })

  it(`handles eq operator`, () =>
    graphql(
      schema,
      `
          {
            allNode(hair: { eq: 2 }) {
              edges { node { hair }}
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()
        expect(result.data.allNode.edges.length).toEqual(1)
        expect(result.data.allNode.edges[0].node.hair).toEqual(2)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`handles ne operator`, () =>
    graphql(
      schema,
      `
          {
            allNode(hair: { ne: 2 }) {
              edges { node { hair }}
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()
        expect(result.data.allNode.edges.length).toEqual(1)
        expect(result.data.allNode.edges[0].node.hair).toEqual(1)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`handles the regex operator`, () =>
    graphql(
      schema,
      `
          {
            allNode(name: { regex: "/^the.*wax/i/" }) {
              edges { node { name }}
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()
        expect(result.data.allNode.edges.length).toEqual(1)
        expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`handles the in operator`, () =>
    graphql(
      schema,
      `
          {
            allNode(anArray: { in: [5] }) {
              edges { node { name }}
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()
        expect(result.data.allNode.edges.length).toEqual(1)
        expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`handles the glob operator`, () =>
    graphql(
      schema,
      `
          {
            allNode(limit: 10, name: { glob: "*Wax" }) {
              edges { node { name }}
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()
        expect(result.data.allNode.edges.length).toEqual(1)
        expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`sorts results`, () =>
    graphql(
      schema,
      `
          {
            allNode(limit: 10, sortBy: { fields: [frontmatter___blue], order: DESC } ) {
              edges { node { name }}
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()
        expect(result.data.allNode.edges.length).toEqual(2)
        expect(result.data.allNode.edges[0].node.name).toEqual(`The Mad Wax`)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`returns list of distinct values in a field`, () =>
    graphql(
      schema,
      `
          {
            allNode {
              totalCount
              names: distinct(field: name)
              array: distinct(field: anArray)
              blue: distinct(field: frontmatter___blue)
              circle: distinct(field: frontmatter___circle) # Only one node has this field
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()

        expect(result.data.allNode.names.length).toEqual(2)
        expect(result.data.allNode.names[0]).toEqual(`The Mad Max`)

        expect(result.data.allNode.array.length).toEqual(5)
        expect(result.data.allNode.array[0]).toEqual(`1`)

        expect(result.data.allNode.blue.length).toEqual(2)
        expect(result.data.allNode.blue[0]).toEqual(`100`)

        expect(result.data.allNode.circle.length).toEqual(1)
        expect(result.data.allNode.circle[0]).toEqual(`happy`)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`handles the groupBy connection field`, () =>
    graphql(
      schema,
      `
          {
            allNode {
              blue: groupBy(field: frontmatter___blue) {
                field
                fieldValue
                totalCount
              }
              anArray: groupBy(field: anArray) {
                field
                fieldValue
                totalCount
              }
            }
          }
          `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()

        expect(result.data.allNode.blue).toHaveLength(2)
        expect(result.data.allNode.blue[0].fieldValue).toEqual(`100`)
        expect(result.data.allNode.blue[0].field).toEqual(`frontmatter.blue`)
        expect(result.data.allNode.blue[0].totalCount).toEqual(1)

        expect(result.data.allNode.anArray).toHaveLength(5)
        expect(result.data.allNode.anArray[0].fieldValue).toEqual(`1`)
        expect(result.data.allNode.anArray[0].field).toEqual(`anArray`)
        expect(result.data.allNode.anArray[0].totalCount).toEqual(2)
      })
      .catch(err => expect(err).not.toBeDefined()))

  it(`can query object arrays`, () =>
    graphql(
      schema,
      `
      {
        allNode {
          anObjectArray {
            aString
            aNumber
            aBoolean
          }
        }
      }
      `
    )
      .then(result => {
        expect(result.errors).not.toBeDefined()

        expect(result.data.allNode.anObjectArray).toHaveLength(2)
        expect(result.data.allNode.anObjectArray[0].aString)
          .toEqual(`some string`)
        expect(result.data.allNode.anObjectArray[0].aNumber).toEqual(2)
        expect(result.data.allNode.anObjectArray[0].aBoolean).toEqual(true)
        expect(result.data.allNode.anObjectArray[1].anArray).toEqual([1, 2])
      })
      .catch(err => expect(err).not.toBeDefined()))
})
