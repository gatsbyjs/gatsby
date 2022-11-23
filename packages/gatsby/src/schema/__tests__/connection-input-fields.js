const { graphql } = require(`graphql`)
const { createSchemaComposer } = require(`../schema-composer`)
const { buildSchema } = require(`../schema`)
const { LocalNodeModel } = require(`../node-model`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

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
      dateArray: [
        `2006-07-22T22:39:53.000Z`,
        `2006-07-04T22:39:53.000Z`,
        `1999-07-04T22:39:53.000Z`,
      ],
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
      dateArray: [
        new Date(`1997-07-04T22:39:53.000Z`),
        new Date(`2006-07-04T22:39:53.000Z`),
        new Date(`1999-07-04T22:39:53.000Z`),
      ],
      anotherKey: {
        withANested: {
          nestedKey: `bar`,
        },
      },
      frontmatter: {
        date: new Date(`2006-07-22T22:39:53.000Z`),
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
  store.dispatch({ type: `START_INCREMENTAL_INFERENCE` })
  nodes.forEach(node =>
    actions.createNode(node, { name: `test` })(store.dispatch)
  )

  const schemaComposer = createSchemaComposer()
  const schema = await buildSchema({
    schemaComposer,
    types: [],
    thirdPartySchemas: [],
    inferenceMetadata: store.getState().inferenceMetadata,
  })
  store.dispatch({ type: `SET_SCHEMA`, payload: schema })
  store.dispatch({ type: `SET_SCHEMA_COMPOSER`, payload: schemaComposer })

  const context = { path: `foo` }
  return graphql({
    schema,
    source: query,
    rootValue: undefined,
    contextValue: {
      ...context,
      nodeModel: new LocalNodeModel({
        schemaComposer,
        schema,
        createPageDependency: jest.fn(),
      }),
    },
  })
}

describe(`connection input fields`, () => {
  it(`returns list of distinct values in a field`, async () => {
    const result = await queryResult(
      makeNodes(),
      `
        {
          allTest {
            totalCount
            names: distinct(field: { name: SELECT })
            array: distinct(field: { anArray: SELECT })
            blue: distinct(field: { frontmatter: { blue: SELECT }})
            dates: distinct(field: { dateArray: SELECT })
            # Only one node has this field
            circle: distinct(field: { frontmatter: { circle: SELECT }})
            nestedField: distinct(field: { anotherKey:{ withANested:{ nestedKey: SELECT }}})
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

    expect(result.data.allTest.dates[2]).toEqual(`2006-07-04T22:39:53.000Z`)
    expect(result.data.allTest.dates.length).toEqual(4)

    expect(result.data.allTest.nestedField.length).toEqual(2)
    expect(result.data.allTest.nestedField[0]).toEqual(`bar`)
    expect(result.data.allTest.nestedField[1]).toEqual(`foo`)
  })

  it(`handles the group connection field`, async () => {
    const result = await queryResult(
      makeNodes(),
      ` {
        allTest {
          blue: group(field: { frontmatter: { blue: SELECT }}) {
            field
            fieldValue
            totalCount
          }
          anArray: group(field: { anArray: SELECT }) {
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
    const result = await queryResult(
      makeNodes(),
      ` {
        allTest {
          nestedKey: group(field: { anotherKey: { withANested: { nestedKey: SELECT }}}) {
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
    const result = await queryResult(
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
