const { graphql } = require(`graphql`)
const { createSchemaComposer } = require(`../schema-composer`)
const { buildSchema } = require(`../schema`)
const { LocalNodeModel } = require(`../node-model`)
const nodeStore = require(`../../db/nodes`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

function makeNodes() {
  return [
    {
      id: `0`,
      internal: { type: `Test`, contentDigest: `0` },
      children: [],
      index: 0,
      name: `The Mad Max`,
      string: `a`,
      float: 1.5,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [1, 2, 3, 4],
      key: {
        withEmptyArray: [],
      },
      anotherKey: {
        withANested: {
          nestedKey: `foo`,
          emptyArray: [],
          anotherEmptyArray: [],
        },
      },
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
      anObjectArray: [
        { aString: `some string`, aNumber: 2, aBoolean: true },
        { aString: `some string`, aNumber: 2, anArray: [1, 2] },
      ],
      boolean: true,
    },
    {
      id: `1`,
      internal: { type: `Test`, contentDigest: `0` },
      children: [],
      index: 1,
      name: `The Mad Wax`,
      string: `b`,
      float: 2.5,
      hair: 2,
      anArray: [1, 2, 5, 4],
      anotherKey: {
        withANested: {
          nestedKey: `foo`,
        },
      },
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
      },
      boolean: false,
      data: {
        tags: [
          {
            tag: {
              document: [
                {
                  data: {
                    tag: `Design System`,
                  },
                  number: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: `2`,
      internal: { type: `Test`, contentDigest: `0` },
      children: [],
      index: 2,
      name: `The Mad Wax`,
      string: `c`,
      float: 3.5,
      hair: 0,
      date: `2006-07-29T22:39:53.000Z`,
      anotherKey: {
        withANested: {
          nestedKey: `bar`,
        },
      },
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of shave and adventure`,
        blue: 10010,
        circle: `happy`,
      },
      data: {
        tags: [
          {
            tag: {
              document: [
                {
                  data: {
                    tag: `Gatsby`,
                  },
                },
              ],
            },
          },
          {
            tag: {
              document: [
                {
                  data: {
                    tag: `Design System`,
                  },
                  number: 5,
                },
              ],
            },
          },
        ],
      },
    },
  ]
}

async function queryResult(nodes, query) {
  store.dispatch({ type: `DELETE_CACHE` })
  nodes.forEach(node =>
    actions.createNode(node, { name: `test` })(store.dispatch)
  )

  const schemaComposer = createSchemaComposer()
  const schema = await buildSchema({
    schemaComposer,
    nodeStore,
    types: [],
    thirdPartySchemas: [],
    inferenceMetadata: store.getState().inferenceMetadata,
  })
  store.dispatch({ type: `SET_SCHEMA`, payload: schema })

  let context = { path: `foo` }
  return graphql(schema, query, undefined, {
    ...context,
    nodeModel: new LocalNodeModel({
      schemaComposer,
      schema,
      nodeStore,
      createPageDependency: jest.fn(),
    }),
  })
}

describe(`connection input fields`, () => {
  it(`returns list of distinct values in a field`, async () => {
    let result = await queryResult(
      makeNodes(),
      `
        {
          allTest {
            totalCount
            names: distinct(field: name)
            array: distinct(field: anArray)
            blue: distinct(field: frontmatter___blue)
            # Only one node has this field
            circle: distinct(field: frontmatter___circle)
            nestedField: distinct(field: anotherKey___withANested___nestedKey)
          }
        }
      `
    )

    expect(result.errors).not.toBeDefined()

    expect(result.data.allTest.names.length).toEqual(2)
    expect(result.data.allTest.names[0]).toEqual(`The Mad Max`)

    expect(result.data.allTest.array.length).toEqual(5)
    expect(result.data.allTest.array[0]).toEqual(`1`)

    expect(result.data.allTest.blue.length).toEqual(2)
    expect(result.data.allTest.blue[0]).toEqual(`100`)

    expect(result.data.allTest.circle.length).toEqual(1)
    expect(result.data.allTest.circle[0]).toEqual(`happy`)

    expect(result.data.allTest.nestedField.length).toEqual(2)
    expect(result.data.allTest.nestedField[0]).toEqual(`bar`)
    expect(result.data.allTest.nestedField[1]).toEqual(`foo`)
  })

  it(`handles the group connection field`, async () => {
    let result = await queryResult(
      makeNodes(),
      ` {
        allTest {
          blue: group(field: frontmatter___blue) {
            field
            fieldValue
            totalCount
          }
          anArray: group(field: anArray) {
            field
            fieldValue
            totalCount
          }
        }
      }`
    )
    expect(result.errors).not.toBeDefined()

    expect(result.data.allTest.blue).toHaveLength(2)
    expect(result.data.allTest.blue[0].fieldValue).toEqual(`100`)
    expect(result.data.allTest.blue[0].field).toEqual(`frontmatter.blue`)
    expect(result.data.allTest.blue[0].totalCount).toEqual(1)

    expect(result.data.allTest.anArray).toHaveLength(5)
    expect(result.data.allTest.anArray[0].fieldValue).toEqual(`1`)
    expect(result.data.allTest.anArray[0].field).toEqual(`anArray`)
    expect(result.data.allTest.anArray[0].totalCount).toEqual(2)
  })

  it(`handles the nested group connection field`, async () => {
    let result = await queryResult(
      makeNodes(),
      ` {
        allTest {
          nestedKey: group(field: anotherKey___withANested___nestedKey) {
            field
            fieldValue
            totalCount
          }
        }
      }`
    )

    expect(result.errors).not.toBeDefined()
    expect(result.data.allTest.nestedKey).toHaveLength(2)
    expect(result.data.allTest.nestedKey[0].fieldValue).toEqual(`bar`)
    expect(result.data.allTest.nestedKey[0].field).toEqual(
      `anotherKey.withANested.nestedKey`
    )
    expect(result.data.allTest.nestedKey[0].totalCount).toEqual(1)
    expect(result.data.allTest.nestedKey[1].fieldValue).toEqual(`foo`)
    expect(result.data.allTest.nestedKey[1].field).toEqual(
      `anotherKey.withANested.nestedKey`
    )
    expect(result.data.allTest.nestedKey[1].totalCount).toEqual(2)
  })

  it(`can query object arrays`, async () => {
    let result = await queryResult(
      makeNodes(),
      `
        {
          allTest {
            edges {
              node {
                anObjectArray {
                  aString
                  aNumber
                  aBoolean
                }
              }
            }
          }
        }
      `
    )
    expect(result.errors).not.toBeDefined()

    expect(result).toMatchSnapshot()
  })
})
