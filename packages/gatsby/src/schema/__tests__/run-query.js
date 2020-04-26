const { runQuery: nodesQuery } = require(`../../db/nodes`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

const makeNodes = () => [
  {
    id: `0`,
    internal: { type: `Test`, contentDigest: `0` },
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
      tags: [`moo`, `foo`],
      blue: 100,
    },
    anObjectArray: [
      { aString: `some string`, aNumber: 2, aBoolean: true },
      { aString: `some string`, aNumber: 2, anArray: [1, 2] },
    ],
    boolean: true,
    nestedRegex: {
      field: `har har`,
    },
  },
  {
    id: `1`,
    internal: { type: `Test`, contentDigest: `0` },
    index: 1,
    name: `The Mad Wax`,
    string: `b`,
    float: 2.5,
    hair: 2,
    anArray: [1, 2, 5, 4],
    waxOnly: {
      foo: true,
      bar: { baz: true },
    },
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
    nestedRegex: {
      field: ``,
    },
  },
  {
    id: `2`,
    internal: { type: `Test`, contentDigest: `0` },
    index: 2,
    name: `The Mad Wax`,
    string: `c`,
    float: 3.5,
    hair: 0,
    date: `2006-07-29T22:39:53.000Z`,
    waxOnly: null,
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

function makeGqlType(nodes) {
  const { createSchemaComposer } = require(`../../schema/schema-composer`)
  const { addInferredFields } = require(`../infer/add-inferred-fields`)
  const { addNodes } = require(`../infer/inference-metadata`)
  const { getExampleObject } = require(`../infer/build-example-data`)

  const sc = createSchemaComposer()
  const typeName = `Test`
  const tc = sc.createObjectTC(typeName)
  const inferenceMetadata = addNodes({ typeName }, nodes)
  addInferredFields({
    schemaComposer: sc,
    typeComposer: tc,
    exampleValue: getExampleObject(inferenceMetadata),
  })
  return { sc, type: tc.getType() }
}

function resetDb(nodes) {
  store.dispatch({ type: `DELETE_CACHE` })
  nodes.forEach(node =>
    actions.createNode(node, { name: `test` })(store.dispatch)
  )
}

async function runQuery(queryArgs) {
  const nodes = makeNodes()
  resetDb(nodes)
  const { sc, type: gqlType } = makeGqlType(nodes)
  const args = {
    gqlType,
    firstOnly: false,
    queryArgs,
    gqlComposer: sc,
    nodeTypeNames: [gqlType.name],
  }
  return await nodesQuery(args)
}

async function runFilter(filter) {
  return await runQuery({ filter })
}

describe(`Filter fields`, () => {
  it(`handles eq operator`, async () => {
    let result = await runFilter({ hair: { eq: 2 } })

    expect(result.length).toEqual(1)
    expect(result[0].hair).toEqual(2)
  })

  it(`handles eq operator with false value`, async () => {
    let result = await runFilter({ boolean: { eq: false } })

    expect(result.length).toEqual(1)
    expect(result[0].name).toEqual(`The Mad Wax`)
  })

  it(`handles eq operator with 0`, async () => {
    let result = await runFilter({ hair: { eq: 0 } })

    expect(result.length).toEqual(1)
    expect(result[0].hair).toEqual(0)
  })

  it(`handles ne operator`, async () => {
    let result = await runFilter({ hair: { ne: 2 } })

    expect(result.length).toEqual(2)
    expect(result[0].hair).toEqual(1)
  })

  it(`handles ne: true operator`, async () => {
    let result = await runFilter({ boolean: { ne: true } })

    expect(result.length).toEqual(2)
  })

  it(`handles nested ne: true operator`, async () => {
    let result = await runFilter({ waxOnly: { foo: { ne: true } } })

    expect(result.length).toEqual(2)
  })

  it(`handles deeply nested ne: true operator`, async () => {
    let result = await runFilter({
      waxOnly: { bar: { baz: { ne: true } } },
    })

    expect(result.length).toEqual(2)
  })

  it(`handles lt operator`, async () => {
    let result = await runFilter({ hair: { lt: 2 } })

    expect(result.length).toEqual(2)
    expect(result[0].hair).toEqual(1)
    expect(result[1].hair).toEqual(0)
  })

  it(`handles lte operator`, async () => {
    let result = await runFilter({ hair: { lte: 1 } })

    expect(result.length).toEqual(2)
    expect(result[0].hair).toEqual(1)
    expect(result[1].hair).toEqual(0)
  })

  it(`handles gt operator`, async () => {
    let result = await runFilter({ hair: { gt: 0 } })

    expect(result.length).toEqual(2)
    expect(result[0].hair).toEqual(1)
    expect(result[1].hair).toEqual(2)
  })

  it(`handles gte operator`, async () => {
    let result = await runFilter({ hair: { gte: 1 } })

    expect(result.length).toEqual(2)
    expect(result[0].hair).toEqual(1)
    expect(result[1].hair).toEqual(2)
  })

  it(`handles the regex operator`, async () => {
    let result = await runFilter({ name: { regex: `/^the.*wax/i` } })
    expect(result.length).toEqual(2)
    expect(result[0].name).toEqual(`The Mad Wax`)
  })

  it(`handles the nested regex operator`, async () => {
    let result = await runFilter({ nestedRegex: { field: { regex: `/.*/` } } })
    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(`0`)
    expect(result[1].id).toEqual(`1`)
  })

  it(`handles the in operator for strings`, async () => {
    let result = await runFilter({ string: { in: [`b`, `c`] } })
    expect(result.length).toEqual(2)
    expect(result[0].index).toEqual(1)
  })

  it(`handles the in operator for ints`, async () => {
    let result = await runFilter({ index: { in: [0, 2] } })
    expect(result.length).toEqual(2)
    expect(result[0].index).toEqual(0)
    expect(result[1].index).toEqual(2)
  })

  it(`handles the in operator for floats`, async () => {
    let result = await runFilter({ float: { in: [1.5, 2.5] } })
    expect(result.length).toEqual(2)
    expect(result[0].index).toEqual(0)
    expect(result[1].index).toEqual(1)
  })

  it(`handles the in operator for booleans`, async () => {
    let result = await runFilter({ boolean: { in: [true] } })
    expect(result.length).toEqual(1) // 2
    expect(result[0].index).toEqual(0)
    //    expect(result[1].index).toEqual(2)
  })

  it(`handles the in operator for array`, async () => {
    let result = await runFilter({ anArray: { in: [5] } })
    expect(result.length).toEqual(1)
    expect(result[0].name).toEqual(`The Mad Wax`)
  })

  it(`handles the nested in operator for array of strings`, async () => {
    let result = await runFilter({ frontmatter: { tags: { in: [`moo`] } } })
    expect(result).toHaveLength(1)
    expect(result[0].name).toEqual(`The Mad Max`)
  })

  it(`handles the elemMatch operator for array of objects`, async () => {
    let result = await runFilter({
      data: {
        tags: {
          elemMatch: {
            tag: {
              document: {
                elemMatch: {
                  data: {
                    tag: { eq: `Gatsby` },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(result.length).toEqual(1)
    expect(result[0].index).toEqual(2)
  })

  it(`handles the elemMatch operator for array of objects (2)`, async () => {
    let result = await runFilter({
      data: {
        tags: {
          elemMatch: {
            tag: {
              document: {
                elemMatch: {
                  data: {
                    tag: { eq: `Design System` },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(result.length).toEqual(2)
    expect(result[0].index).toEqual(1)
    expect(result[1].index).toEqual(2)
  })

  it(`handles the elemMatch operator for array of objects (number)`, async () => {
    let result = await runFilter({
      data: {
        tags: {
          elemMatch: {
            tag: {
              document: {
                elemMatch: {
                  number: { lt: 4 },
                },
              },
            },
          },
        },
      },
    })

    expect(result.length).toEqual(1)
    expect(result[0].index).toEqual(1)
  })

  it(`handles the nin operator for array`, async () => {
    let result = await runFilter({ anArray: { nin: [5] } })

    expect(result.length).toEqual(2)

    result.forEach(edge => {
      expect(edge.anArray).not.toEqual(expect.arrayContaining([5]))
    })
  })

  it(`handles the nin operator for strings`, async () => {
    let result = await runFilter({ string: { nin: [`b`, `c`] } })

    expect(result.length).toEqual(1)
    result.forEach(edge => {
      expect(edge.string).not.toEqual(`b`)
      expect(edge.string).not.toEqual(`c`)
    })
  })

  it(`handles the nin operator for ints`, async () => {
    let result = await runFilter({ index: { nin: [0, 2] } })

    expect(result.length).toEqual(1)
    result.forEach(edge => {
      expect(edge.index).not.toEqual(0)
      expect(edge.index).not.toEqual(2)
    })
  })

  it(`handles the nin operator for floats`, async () => {
    let result = await runFilter({ float: { nin: [1.5] } })

    expect(result.length).toEqual(2)
    result.forEach(edge => {
      expect(edge.float).not.toEqual(1.5)
    })
  })

  it(`handles the nin operator for booleans`, async () => {
    let result = await runFilter({ boolean: { nin: [true, null] } })

    expect(result.length).toEqual(1)
    expect(result[0].boolean).toBe(false)
  })

  it(`handles the glob operator`, async () => {
    let result = await runFilter({ name: { glob: `*Wax` } })

    expect(result.length).toEqual(2)
    expect(result[0].name).toEqual(`The Mad Wax`)
  })

  it(`filters date fields`, async () => {
    let result = await runFilter({ date: { ne: null } })

    expect(result.length).toEqual(2)
    expect(result[0].index).toEqual(0)
    expect(result[1].index).toEqual(2)
  })

  it(`handles the eq operator for array field values`, async () => {
    const result = await runFilter({ anArray: { eq: 5 } })

    expect(result.length).toBe(1)
    expect(result[0].index).toBe(1)
  })

  it(`handles the ne operator for array field values`, async () => {
    const result = await runFilter({ anArray: { ne: 1 } })

    expect(result.length).toBe(1)
    expect(result[0].index).toBe(2)
  })
})

describe(`collection fields`, () => {
  it(`sorts results`, async () => {
    let result = await runQuery({
      limit: 10,
      sort: {
        fields: [`frontmatter.blue`],
        order: [`desc`],
      },
    })

    expect(result.length).toEqual(3)
    expect(result[0].name).toEqual(`The Mad Wax`)
  })

  it(`sorts results with desc has null fields first`, async () => {
    let result = await runQuery({
      limit: 10,
      sort: {
        fields: [`waxOnly`],
        order: [`desc`],
      },
    })

    expect(result.length).toEqual(3)
    expect(result[0].id).toEqual(`0`)
    expect(result[1].id).toEqual(`2`)
    expect(result[2].id).toEqual(`1`)
  })

  it(`sorts results with asc has null fields last`, async () => {
    let result = await runQuery({
      limit: 10,
      sort: {
        fields: [`waxOnly`],
        order: [`asc`],
      },
    })

    expect(result.length).toEqual(3)
    expect(result[0].id).toEqual(`1`)
    expect(result[1].id).toEqual(`2`)
    expect(result[2].id).toEqual(`0`)
  })

  it(`applies specified sort order, and sorts asc by default`, async () => {
    let result = await runQuery({
      limit: 10,
      sort: {
        fields: [`frontmatter.blue`, `id`],
        order: [`desc`], // `id` field will be sorted asc
      },
    })

    expect(result.length).toEqual(3)
    expect(result[0].id).toEqual(`1`) // blue = 10010, id = 1
    expect(result[1].id).toEqual(`2`) // blue = 10010, id = 2
    expect(result[2].id).toEqual(`0`) // blue = 100, id = 0
  })

  it(`applies specified sort order per field`, async () => {
    let result = await runQuery({
      limit: 10,
      sort: {
        fields: [`frontmatter.blue`, `id`],
        order: [`desc`, `desc`], // `id` field will be sorted desc
      },
    })

    expect(result.length).toEqual(3)
    expect(result[0].id).toEqual(`2`) // blue = 10010, id = 2
    expect(result[1].id).toEqual(`1`) // blue = 10010, id = 1
    expect(result[2].id).toEqual(`0`) // blue = 100, id = 0
  })
})
