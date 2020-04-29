const { runQuery: nodesQuery } = require(`../../db/nodes`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

// Note: loki does not match redux in certain node cases in this file
const IS_LOKI = require(`../../db/__tests__/fixtures/ensure-loki`)()

const makeNodesUneven = () => [
  // Note: This is assumed to be an uneven node count
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
    strArray: `["testing", "serialization", "hacks"]`,
    nullArray: [1, null, 3, 4],
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
    nil: `not null`,
    nestedRegex: {
      field: `har har`,
    },
    num_null_not: 1,
    num_not_null: 1,
    null_num_not: null,
    null_not_num: null,
    str_null_not: `x`,
    str_not_null: `x`,
    null_str_not: null,
    null_not_str: null,
    obj_null_not: { y: 5 },
    obj_not_null: { y: 5 },
    null_obj_not: null,
    null_not_obj: null,
    exh: 2,
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
    singleArray: [8],
    strArray: `[5,6,7,8]`,
    nullArray: [1, 3, 4],
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
    nil: null,
    undef: undefined,
    singleElem: {
      things: [
        {
          one: {
            two: {
              three: 123,
            },
          },
        },
        {
          one: {
            five: {
              three: 153,
            },
          },
        },
        {
          one: {
            two: {
              three: 404,
            },
          },
        },
      ],
    },
    nestedRegex: {
      field: ``,
    },
    strSecondOnly: `needle`,
    boolSecondOnly: false,
    num_null_not: null,
    null_num_not: 1,
    not_null_num: null,
    not_num_null: 1,
    str_null_not: null,
    null_str_not: `x`,
    not_null_str: null,
    not_str_null: `x`,
    obj_null_not: null,
    null_obj_not: { y: 5 },
    not_null_obj: null,
    not_obj_null: { y: 5 },
    exh: 3,
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
    num_not_null: null,
    null_not_num: 1,
    not_null_num: 1,
    not_num_null: null,
    str_not_null: null,
    null_not_str: `x`,
    not_null_str: `x`,
    not_str_null: null,
    obj_not_null: null,
    null_not_obj: { y: 5 },
    not_null_obj: { y: 5 },
    not_obj_null: null,
    exh: 1,
  },
]
const makeNodesEven = () => [
  // Deliberate even count of nodes to test lt/lte/gt/gte search
  {
    id: `0`,
    internal: { type: `Test`, contentDigest: `0` },
    exh: 2,
  },
  {
    id: `1`,
    internal: { type: `Test`, contentDigest: `1` },
    exh: 4,
  },
  {
    id: `2`,
    internal: { type: `Test`, contentDigest: `2` },
    exh: 1,
  },
  {
    id: `3`,
    internal: { type: `Test`, contentDigest: `3` },
    exh: 3,
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

async function runQuery(queryArgs, filtersCache, nodes = makeNodesUneven()) {
  resetDb(nodes)
  const { sc, type: gqlType } = makeGqlType(nodes)
  const args = {
    gqlType,
    firstOnly: false,
    queryArgs,
    gqlComposer: sc,
    nodeTypeNames: [gqlType.name],
    filtersCache,
  }
  return await nodesQuery(args)
}

async function runQuery2(queryArgs, filtersCache) {
  const nodes = makeNodesUneven()
  return [await runQuery(queryArgs, filtersCache, nodes), nodes]
}

async function runFilterOnCache(filter, filtersCache) {
  return await runQuery2({ filter }, filtersCache)
}

it(`should use the cache argument`, async () => {
  // Loki does not use this system at all
  if (IS_LOKI) return

  const filtersCache = new Map()
  const [result] = await runFilterOnCache({ hair: { eq: 2 } }, filtersCache)

  // Validate answer
  expect(result.length).toEqual(1)
  expect(result[0].hair).toEqual(2)

  // Confirm cache is not ignored
  expect(filtersCache.size === 1).toBe(true)
  filtersCache.forEach(
    (
      filterCache /*: FilterCache */
      //cacheKey /*: FilterCacheKey */
    ) => {
      // This test will change when the composition of the FilterCache changes
      // For now it should be a Map of values to Set of nodes
      expect(filterCache instanceof Object).toBe(true)
      expect(filterCache.byValue instanceof Map).toBe(true)
      expect(filterCache.meta instanceof Object).toBe(true)
      // There ought to be at least one value mapped (probably more, shrug)
      expect(filterCache.byValue.size >= 1).toBe(true)
    }
  )
})

// Make sure to test fast filters (with cache) and Sift (without cache)
;[
  { desc: `without cache`, cb: () => null }, // Forces no cache, must use Sift
  { desc: `with cache`, cb: () => new Map() },
].forEach(({ desc, cb: createFiltersCache }) => {
  async function runFilter(filter) {
    return runFilterOnCache(filter, createFiltersCache())
  }

  describe(desc, () => {
    describe(`Filter fields`, () => {
      describe(`$eq`, () => {
        it(`handles eq operator with number value`, async () => {
          const needle = 2
          const [result, allNodes] = await runFilter({ hair: { eq: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair === needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair).toEqual(needle))
        })

        it(`handles eq operator with false value`, async () => {
          const needle = false
          const [result, allNodes] = await runFilter({
            boolean: { eq: needle },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.boolean === needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.boolean).toEqual(needle))
        })

        it(`handles eq operator with 0`, async () => {
          const needle = 0
          const [result, allNodes] = await runFilter({ hair: { eq: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair === needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair).toEqual(needle))
        })

        it(`handles eq operator with null`, async () => {
          const needle = null // note: this should find nodes with null OR undefined (apparently)
          const [result, allNodes] = await runFilter({ nil: { eq: needle } })

          // Also returns nodes that do not have the property at all (NULL in db)
          expect(result?.length).toEqual(
            allNodes.filter(node => node.nil == needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.nil == null).toEqual(true))
        })

        // grapqhl would never pass on `undefined`
        // it(`handles eq operator with undefined`, async () => {
        //   const [result, allNodes] = await runFilter({ undef: { eq: undefined } })
        //
        //   expect(result.length).toEqual(?)
        //   expect(result[0].hair).toEqual(?)
        // })

        it(`handles eq operator with serialized array value`, async () => {
          const needle = `[5,6,7,8]`
          const [result, allNodes] = await runFilter({
            strArray: { eq: needle },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.strArray === needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.strArray).toEqual(needle))
        })

        it(`finds numbers inside arrays`, async () => {
          const needle = 3
          const [result, allNodes] = await runFilter({
            anArray: { eq: needle },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.anArray?.includes(needle)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.anArray?.includes(needle)).toEqual(true)
          )
        })

        it(`finds numbers inside single-element arrays`, async () => {
          const needle = 8
          const [result, allNodes] = await runFilter({
            singleArray: { eq: needle },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.singleArray?.includes(needle)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.singleArray?.includes(needle)).toEqual(true)
          )
        })

        it(`does not coerce numbers against single-element arrays`, async () => {
          if (IS_LOKI) return

          const needle = `8` // note: `('8' == [8]) === true`
          const [result] = await runFilter({
            singleArray: { eq: needle },
          })

          // Note: no coercion, so [8]=='8' is true but Sift ignores those
          expect(result).toEqual(null)
        })
      })

      describe(`$ne`, () => {
        it(`handles ne operator`, async () => {
          if (IS_LOKI) return

          const needle = 2
          const [result, allNodes] = await runFilter({ hair: { ne: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair !== needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair).not.toEqual(needle))
        })

        it(`coerces number to string`, async () => {
          if (IS_LOKI) return

          const needle = 2 // Note: `id` is a numstr
          const [result, allNodes] = await runFilter({ id: { ne: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.id !== needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.id).not.toEqual(needle))
        })

        // This test causes a stack overflow right now
        it.skip(`dpes not coerce string to number`, async () => {
          if (IS_LOKI) return

          const needle = `2` // Note: `id` is a numstr
          const [result] = await runFilter({ id: { hair: needle } })

          expect(result).toEqual(null)
        })

        it(`handles ne operator with true`, async () => {
          const needle = true
          const [result, allNodes] = await runFilter({ boolean: { ne: true } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.boolean !== needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.boolean).not.toEqual(needle))
        })

        it(`handles nested ne operator with true`, async () => {
          const needle = true
          const [result, allNodes] = await runFilter({
            waxOnly: { foo: { ne: true } },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.waxOnly?.foo !== needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.waxOnly?.foo).not.toEqual(needle))
        })

        it(`handles ne operator with 0`, async () => {
          const needle = 0
          const [result, allNodes] = await runFilter({ hair: { ne: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair !== needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair).not.toEqual(needle))
        })

        it(`handles ne operator with null`, async () => {
          if (IS_LOKI) return

          const needle = 0
          const [result, allNodes] = await runFilter({ nil: { ne: needle } })

          // Should only return nodes who do have the property, not set to null
          expect(result?.length).toEqual(
            allNodes.filter(node => node.nil !== needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.nil).not.toEqual(needle))
        })

        // grapqhl would never pass on `undefined`
        // it(`handles ne operator with undefined`, async () => {
        //   const [result, allNodes] = await runFilter({ undef: { ne: undefined } })
        //
        //   expect(result.length).toEqual(?)
        //   expect(result?.length).toEqual(allNodes.filter(node => node.nil !== needle).length)
        //   expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
        //   result.forEach(node => expect(node.nil).not.toEqual(needle))
        // })

        it(`handles deeply nested ne: true operator`, async () => {
          const needle = true
          const [result, allNodes] = await runFilter({
            waxOnly: { bar: { baz: { ne: needle } } },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.waxOnly?.bar?.baz !== needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.waxOnly?.bar?.baz).not.toEqual(needle)
          )
        })

        it(`handles the ne operator for array field values`, async () => {
          const needle = 1
          const [result, allNodes] = await runFilter({
            anArray: { ne: needle },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => !node.anArray?.includes(needle)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.anArray?.includes(needle)).not.toEqual(true)
          )
        })
      })

      describe(`$lt`, () => {
        it(`handles lt operator with number`, async () => {
          const needle = 1
          const [result, allNodes] = await runFilter({ hair: { lt: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair < needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair < needle).toEqual(true))
        })

        async function confirmPosition(allNodes, needle) {
          if (IS_LOKI) return

          const result = await runQuery(
            { filter: { exh: { lt: needle } } },
            createFiltersCache(),
            allNodes
          )

          // Just check whether the reported count is equal to the actual count
          // We prepend the "hint" to make debugging easier; this way you know whether it's even/uneven and needle
          expect(result?.length ?? 0).toEqual(
            allNodes.filter(node => node.exh < needle).length
          )
        }

        ;[`uneven`, `even`].forEach(count => {
          describe(`positional checks for count=` + count, () => {
            for (let i = 0; i < 5; i += 0.5) {
              it(
                `should be able to lt anywhere in an array i=` + i.toFixed(1),
                async () => {
                  // Test op on all positions in an even/uneven ordered node list. `exh` will only be 1,2,3,4 or 1,2,3
                  // This checks the ordered search, to check before, on every, between, and after each position in the list
                  await confirmPosition(
                    count === `even` ? makeNodesEven() : makeNodesUneven(),
                    i
                  )
                }
              )
            }
          })
        })

        // Note: this test currently stackoverflows
        it.skip(`should lt when type coercion fails direct value lookup`, async () => {
          // Here 1.5 exists but only as number. However, `1.5 < '1.5' === true`
          // This test checks whether we don't incorrectly assume that if the
          // value wasn't mapped, that it can't be found.
          const needle = `1.5`
          const [result, allNodes] = await runFilter({ float: { lt: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.float < needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.float < needle).toEqual(true))
        })

        it(`handles lt operator with null`, async () => {
          if (IS_LOKI) return

          const needle = null
          const [result, allNodes] = await runFilter({ nil: { lt: needle } })

          // Nothing is lt null so zero nodes should match
          // (Note: this is different from `lte`, which does return nulls here!)
          expect(result).toEqual(null)
          expect(
            allNodes.filter(node => node.nil === needle).length
          ).toBeGreaterThan(0) // They should _exist_...
        })
      })

      describe(`$lte`, () => {
        it(`handles lte operator with number`, async () => {
          const needle = 1
          const [result, allNodes] = await runFilter({ hair: { lte: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair <= needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair <= needle).toEqual(true))
        })

        async function confirmPosition(allNodes, needle) {
          if (IS_LOKI) return

          const result = await runQuery(
            { filter: { exh: { lte: needle } } },
            createFiltersCache(),
            allNodes
          )

          // Just check whether the reported count is equal to the actual count
          // We prepend the "hint" to make debugging easier; this way you know whether it's even/uneven and needle
          expect(result?.length ?? 0).toEqual(
            allNodes.filter(node => node.exh <= needle).length
          )
        }

        ;[`uneven`, `even`].forEach(count => {
          describe(`positional checks for count=` + count, () => {
            for (let i = 0; i < 5; i += 0.5) {
              it(
                `should be able to lte anywhere in an array i=` + i.toFixed(1),
                async () => {
                  // Test op on all positions in an even/uneven ordered node list. `exh` will only be 1,2,3,4 or 1,2,3
                  // This checks the ordered search, to check before, on every, between, and after each position in the list
                  await confirmPosition(
                    count === `even` ? makeNodesEven() : makeNodesUneven(),
                    i
                  )
                }
              )
            }
          })
        })

        // Note: this test currently stackoverflows
        it.skip(`should lte when type coercion fails direct value lookup`, async () => {
          // Here 1.5 exists but only as number. However, `1.5 <= '1.5' === true`
          // This test checks whether we don't incorrectly assume that if the
          // value wasn't mapped, that it can't be found.
          const needle = `1.5`
          const [result, allNodes] = await runFilter({ float: { lte: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.float <= needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.float <= needle).toEqual(true))
        })

        it(`handles lte operator with null`, async () => {
          if (IS_LOKI) return

          const needle = null
          const [result, allNodes] = await runFilter({ nil: { lte: needle } })

          // lte null matches null but no nodes without the property (NULL)
          expect(result?.length).toEqual(
            allNodes.filter(node => node.nil === needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.nil === needle).toEqual(true))
        })
      })

      describe(`$gt`, () => {
        it(`handles gt operator with number`, async () => {
          const needle = 1
          const [result, allNodes] = await runFilter({ hair: { gt: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair > needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair > needle).toEqual(true))
        })

        async function confirmPosition(allNodes, needle) {
          if (IS_LOKI) return

          const result = await runQuery(
            { filter: { exh: { gt: needle } } },
            createFiltersCache(),
            allNodes
          )

          // Just check whether the reported count is equal to the actual count
          // We prepend the "hint" to make debugging easier; this way you know whether it's even/uneven and needle
          expect(result?.length ?? 0).toEqual(
            allNodes.filter(node => node.exh > needle).length
          )
        }

        ;[`uneven`, `even`].forEach(count => {
          describe(`positional checks for count=` + count, () => {
            for (let i = 0; i < 5; i += 0.5) {
              it(
                `should be able to gt anywhere in an array i=` + i.toFixed(1),
                async () => {
                  // Test op on all positions in an even/uneven ordered node list. `exh` will only be 1,2,3,4 or 1,2,3
                  // This checks the ordered search, to check before, on every, between, and after each position in the list
                  await confirmPosition(
                    count === `even` ? makeNodesEven() : makeNodesUneven(),
                    i
                  )
                }
              )
            }
          })
        })

        // Note: this test currently stackoverflows
        it.skip(`should gt when type coercion fails direct value lookup`, async () => {
          // Here 1.5 exists but only as number. However, `1.5 < '1.5' === true`
          // This test checks whether we don't incorrectly assume that if the
          // value wasn't mapped, that it can't be found.
          const needle = `1.5`
          const [result, allNodes] = await runFilter({ float: { gt: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.float > needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.float > needle).toEqual(true))
        })

        it(`handles gt operator with null`, async () => {
          if (IS_LOKI) return

          const needle = null
          const [result, allNodes] = await runFilter({ nil: { gt: needle } })

          // Nothing is gt null so zero nodes should match
          // (Note: this is different from `gte`, which does return nulls here!)
          expect(result).toEqual(null)
          expect(
            allNodes.filter(node => node.nil === needle).length
          ).toBeGreaterThan(0) // They should _exist_...
        })
      })

      describe(`$gte`, () => {
        it(`handles gte operator with number`, async () => {
          const needle = 1
          const [result, allNodes] = await runFilter({ hair: { gte: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.hair >= needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.hair >= needle).toEqual(true))
        })

        async function confirmPosition(allNodes, needle) {
          if (IS_LOKI) return

          const result = await runQuery(
            { filter: { exh: { gte: needle } } },
            createFiltersCache(),
            allNodes
          )

          // Just check whether the reported count is equal to the actual count
          // We prepend the "hint" to make debugging easier; this way you know whether it's even/uneven and needle
          expect(result?.length ?? 0).toEqual(
            allNodes.filter(node => node.exh >= needle).length
          )
        }

        ;[`uneven`, `even`].forEach(count => {
          describe(`positional checks for count=` + count, () => {
            for (let i = 0; i < 5; i += 0.5) {
              it(
                `should be able to gte anywhere in an array i=` + i.toFixed(1),
                async () => {
                  // Test op on all positions in an even/uneven ordered node list. `exh` will only be 1,2,3,4 or 1,2,3
                  // This checks the ordered search, to check before, on every, between, and after each position in the list
                  await confirmPosition(
                    count === `even` ? makeNodesEven() : makeNodesUneven(),
                    i
                  )
                }
              )
            }
          })
        })

        // Note: this test currently stackoverflows
        it.skip(`should gte when type coercion fails direct value lookup`, async () => {
          // Here 1.5 exists but only as number. However, `1.5 < '1.5' === true`
          // This test checks whether we don't incorrectly assume that if the
          // value wasn't mapped, that it can't be found.
          const needle = `1.5`
          const [result, allNodes] = await runFilter({ float: { gte: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.float >= needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.float >= needle).toEqual(true))
        })

        it(`handles gte operator with null`, async () => {
          if (IS_LOKI) return

          const needle = null
          const [result, allNodes] = await runFilter({ nil: { gte: needle } })

          // gte null matches null but no nodes without the property (NULL)
          expect(result?.length).toEqual(
            allNodes.filter(node => node.nil === needle).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.nil === needle).toEqual(true))
        })
      })

      describe(`$regex`, () => {
        it(`handles the regex operator without flags`, async () => {
          const needleStr = `/^The.*Wax/`
          const needleRex = /^The.*Wax/
          const [result, allNodes] = await runFilter({
            name: { regex: needleStr },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => needleRex.test(node.name)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(needleRex.test(node.name)).toEqual(true)
          )
        })

        it(`handles the regex operator with i-flag`, async () => {
          // Note: needle is different from checked because `new RegExp('/a/i')` does _not_ work
          const needleRex = /^the.*wax/i
          const needleStr = `/^the.*wax/i`
          const [result, allNodes] = await runFilter({
            name: { regex: needleStr },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => needleRex.test(node.name)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(needleRex.test(node.name)).toEqual(true)
          )
        })

        it(`handles the nested regex operator`, async () => {
          const needleStr = `/.*/`
          const needleRex = /.*/
          const [result, allNodes] = await runFilter({
            nestedRegex: { field: { regex: needleStr } },
          })

          expect(result?.length).toEqual(
            allNodes.filter(
              node => node.nestedRegex && needleRex.test(node.nestedRegex.field)
            ).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(
              node.nestedRegex && needleRex.test(node.nestedRegex.field)
            ).toEqual(true)
          )
        })

        it(`does not match double quote for string without it`, async () => {
          if (IS_LOKI) return

          const [result, allNodes] = await runFilter({ name: { regex: `/"/` } })

          expect(result).toEqual(null)
          expect(allNodes.filter(node => node.name === `"`).length).toEqual(0)
        })
      })

      describe(`$in`, () => {
        it(`handles the in operator for strings`, async () => {
          const needle = [`b`, `c`]
          const [result, allNodes] = await runFilter({
            string: { in: needle },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => needle.includes(node.string)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(needle.includes(node.string)).toEqual(true)
          )
        })

        it(`handles the in operator for ints`, async () => {
          const needle = [0, 2]
          const [result, allNodes] = await runFilter({ index: { in: needle } })

          expect(result?.length).toEqual(
            allNodes.filter(node => needle.includes(node.index)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(needle.includes(node.index)).toEqual(true)
          )
        })

        it(`handles the in operator for floats`, async () => {
          const needle = [1.5, 2.5]
          const [result, allNodes] = await runFilter({
            float: { in: needle },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => needle.includes(node.float)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(needle.includes(node.float)).toEqual(true)
          )
        })

        it(`handles the in operator for just null`, async () => {
          if (IS_LOKI) return

          const [result, allNodes] = await runFilter({ nil: { in: [null] } })

          // Do not include the nodes without a `nil` property
          // May not have the property, or must be null
          expect(result?.length).toEqual(
            allNodes.filter(node => node.nil === undefined || node.nil === null)
              .length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.nil === undefined || node.nil === null).toEqual(true)
          )
        })

        it(`handles the in operator for double null`, async () => {
          if (IS_LOKI) return

          const [result, allNodes] = await runFilter({
            nil: { in: [null, null] },
          })

          // Do not include the nodes without a `nil` property
          // May not have the property, or must be null
          expect(result?.length).toEqual(
            allNodes.filter(node => node.nil === undefined || node.nil === null)
              .length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.nil === undefined || node.nil === null).toEqual(true)
          )
        })

        it(`handles the in operator for null in int and null`, async () => {
          if (IS_LOKI) return

          const [result, allNodes] = await runFilter({ nil: { in: [5, null] } })

          // Include the nodes without a `nil` property
          expect(result?.length).toEqual(
            allNodes.filter(node => node.nil === undefined || node.nil === null)
              .length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.nil === undefined || node.nil === null).toEqual(true)
          )
        })

        it(`handles the in operator for int in int and null`, async () => {
          const [result, allNodes] = await runFilter({
            index: { in: [2, null] },
          })

          // Include the nodes without a `index` property (there aren't any)
          expect(result?.length).toEqual(
            allNodes.filter(
              node =>
                node.index === undefined ||
                node.index === null ||
                node.index === 2
            ).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(
              node.index === undefined ||
                node.index === null ||
                node.index === 2
            ).toEqual(true)
          )
        })

        it(`handles the in operator for booleans`, async () => {
          const [result, allNodes] = await runFilter({
            boolean: { in: [true] },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node => node.boolean === true).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node => expect(node.boolean === true).toEqual(true))
        })

        it(`handles the in operator for array with one element`, async () => {
          // Note: `node.anArray` doesn't exist or it's an array of multiple numbers
          const [result, allNodes] = await runFilter({ anArray: { in: [5] } })

          // The first one has a 5, the second one does not have a 5, the third does
          // not have the property at all (NULL). It should return the first and last.
          // (If the target value has `null` then the third should be omitted)
          expect(result?.length).toEqual(
            allNodes.filter(node => node.anArray?.includes(5)).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(node.anArray?.includes(5)).toEqual(true)
          )
        })

        it(`handles the in operator for array some elements`, async () => {
          // Note: `node.anArray` doesn't exist or it's an array of multiple numbers
          const needle = [20, 5, 300]
          const [result, allNodes] = await runFilter({
            anArray: { in: needle },
          })

          // Same as the test for just `[5]`. 20 and 300 do not appear anywhere.
          expect(result?.length).toEqual(
            allNodes.filter(node => node.anArray?.some(n => needle.includes(n)))
              .length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(
              node.anArray && needle.some(n => node.anArray.includes(n))
            ).toEqual(true)
          )
        })

        it(`handles the nested in operator for array of strings`, async () => {
          const needle = [`moo`]
          const [result, allNodes] = await runFilter({
            frontmatter: { tags: { in: needle } },
          })

          expect(result?.length).toEqual(
            allNodes.filter(node =>
              node.frontmatter.tags?.some(n => needle.includes(n))
            ).length
          )
          expect(result?.length).toBeGreaterThan(0) // Make sure there _are_ results, don't let this be zero
          result.forEach(node =>
            expect(
              node.frontmatter?.tags &&
                needle.some(n => node.frontmatter.tags.includes(n))
            ).toEqual(true)
          )
        })
      })

      describe(`$elemMatch`, () => {
        it(`handles the elemMatch operator on a proper single tree`, async () => {
          const [result] = await runFilter({
            singleElem: {
              things: {
                elemMatch: {
                  one: {
                    two: {
                      three: { eq: 123 },
                    },
                  },
                },
              },
            },
          })

          expect(result.length).toEqual(1)
          expect(
            result[0]?.singleElem?.things.some(e => e?.one?.two?.three === 123)
          ).toEqual(true)
        })

        it(`handles the elemMatch operator on the second element`, async () => {
          const [result] = await runFilter({
            singleElem: {
              things: {
                elemMatch: {
                  one: {
                    five: {
                      three: { eq: 153 },
                    },
                  },
                },
              },
            },
          })

          expect(result.length).toEqual(1)
          // Should contain the entire array even only one matched
          expect(result[0].singleElem.things[0].one.two.three).toEqual(123)
          expect(result[0].singleElem.things[1].one.five.three).toEqual(153)
        })

        it(`should return only one node if elemMatch hits multiples`, async () => {
          const [result] = await runFilter({
            singleElem: {
              things: {
                elemMatch: {
                  one: {
                    two: {
                      three: { lt: 1000 }, // one match is 123, the other 404
                    },
                  },
                },
              },
            },
          })

          // The `elemMatch` operator only returns the first nodde that matches so
          // even though the `lt 1000` would match two elements in the `things` array
          // it will return one node.
          expect(result.length).toEqual(1)
          expect(result[0].singleElem.things[0].one.two.three).toEqual(123)
          expect(result[0].singleElem.things[2].one.two.three).toEqual(404)
        })

        it(`ignores the elemMatch operator on a partial sub tree`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            singleElem: {
              things: {
                elemMatch: {
                  three: { eq: 123 },
                },
              },
            },
          })

          expect(result).toEqual(null)
        })

        it(`handles the elemMatch operator for array of objects (1)`, async () => {
          const [result] = await runFilter({
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
          const [result] = await runFilter({
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

          expect(result.length).toEqual(1)
          expect(result[0].index).toEqual(2)
        })

        it(`works for elemMatch on boolean field`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            boolean: {
              elemMatch: {
                eq: true,
              },
            },
          })

          // Does NOT contain nodes that do not have the field
          expect(result.length).toEqual(1)
          expect(result[0].boolean).toEqual(true)
        })

        it(`skips nodes without the field for elemMatch on boolean`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            boolSecondOnly: {
              elemMatch: {
                eq: false,
              },
            },
          })

          // Does NOT contain nodes that do not have the field so returns 2nd node
          expect(result.length).toEqual(1)
          expect(result[0].boolSecondOnly).toEqual(false)
        })

        it(`works for elemMatch on string field`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            string: {
              elemMatch: {
                eq: `a`,
              },
            },
          })

          // Does NOT contain nodes that do not have the field
          expect(result.length).toEqual(1)
          expect(result[0].string).toEqual(`a`)
        })

        it(`should return all nodes for elemMatch on non-arrays too`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            name: {
              elemMatch: {
                eq: `The Mad Wax`,
              },
            },
          })

          // Can return more than one node
          // Does NOT contain nodes that do not have the field
          expect(result.length).toEqual(2)
          expect(result[0].name).toEqual(`The Mad Wax`)
          expect(result[1].name).toEqual(`The Mad Wax`)
        })

        it(`skips nodes without the field for elemMatch on string`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            strSecondOnly: {
              elemMatch: {
                eq: `needle`,
              },
            },
          })

          // Does NOT contain nodes that do not have the field so returns 2nd node
          expect(result.length).toEqual(1)
          expect(result[0].strSecondOnly).toEqual(`needle`)
        })

        it(`works for elemMatch on number field`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            float: {
              elemMatch: {
                eq: 1.5,
              },
            },
          })

          // Does NOT contain nodes that do not have the field
          expect(result.length).toEqual(1)
          expect(result[0].float).toEqual(1.5)
        })
      })

      describe(`$nin`, () => {
        it(`handles the nin operator for array [5]`, async () => {
          const [result] = await runFilter({ anArray: { nin: [5] } })

          // Since the array does not contain `null`, the query should also return the
          // nodes that do not have the field at all (NULL).

          expect(result.length).toEqual(2)
          // Either does not exist or does not contain
          result
            .filter(node => node.anArray !== undefined)
            .forEach(node => {
              // In this test, if the property exists it should be an array
              expect(Array.isArray(node.anArray)).toBe(true)
              expect(node.anArray.includes(5)).toBe(false)
            })
        })

        it(`handles the nin operator for array [null]`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            nullArray: { nin: [null] },
          })

          // Since the array contains `null`, the query should NOT return the
          // nodes that do not have the field at all (NULL).

          expect(result.length).toEqual(1)
          expect(result[0].nullArray.includes(null)).toBe(false)
        })

        it(`handles the nin operator for strings`, async () => {
          const [result] = await runFilter({
            string: { nin: [`b`, `c`] },
          })

          expect(result.length).toEqual(1)
          result.forEach(node => {
            expect(node.string).not.toEqual(`b`)
            expect(node.string).not.toEqual(`c`)
          })
        })

        it(`handles the nin operator for ints`, async () => {
          const [result] = await runFilter({ index: { nin: [0, 2] } })

          expect(result.length).toEqual(1)
          result.forEach(node => {
            expect(node.index).not.toEqual(0)
            expect(node.index).not.toEqual(2)
          })
        })

        it(`handles the nin operator for floats`, async () => {
          const [result] = await runFilter({ float: { nin: [1.5] } })

          expect(result.length).toEqual(2)
          result.forEach(node => {
            // Might not have the property (-> undefined), must not be 1.5
            expect(node.float).not.toEqual(1.5)
          })
        })

        it(`handles the nin operator for booleans`, async () => {
          const [result] = await runFilter({
            boolean: { nin: [true, null] },
          })

          // Do not return the node that does not have the field because of `null`
          expect(result.length).toEqual(1)
          result.forEach(node => {
            // Must have the property, must not be true nor null
            expect(node.boolean !== undefined).toBe(true)
            expect(node.boolean !== true && node.boolean !== null).toBe(true)
          })
        })

        it(`handles the nin operator for double null`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            nil: { nin: [null, null] },
          })

          // Do not return the node that does not have the field because of `null`
          expect(result.length).toEqual(1)
          result.forEach(node => {
            // Must have the property, must not be null
            expect(node.nil !== undefined).toBe(true)
            expect(node.nil !== null).toBe(true)
          })
        })

        it(`handles the nin operator for null in int+null`, async () => {
          if (IS_LOKI) return

          const [result] = await runFilter({
            nil: { nin: [5, null] },
          })

          // Do not return the node that does not have the field because of `null`
          expect(result.length).toEqual(1)
          result.forEach(node => {
            // Must have the property, must not be 5 nor null
            expect(node.nil !== undefined).toBe(true)
            expect(node.nil !== 5 && node.nil !== null).toBe(true)
          })
        })

        it(`handles the nin operator for int in int+null`, async () => {
          const [result] = await runFilter({
            index: { nin: [2, null] },
          })

          // Do not return the node that does not have the field because of `null`
          expect(result.length).toEqual(2)
          result.forEach(node => {
            // Must have the property, must not be 2 nor null
            expect(node.index !== undefined).toBe(true)
            expect(node.index !== 2 && node.index !== null).toBe(true)
          })
        })
      })

      describe(`$glob`, () => {
        it(`handles the glob operator`, async () => {
          const [result] = await runFilter({ name: { glob: `*Wax` } })

          expect(result.length).toEqual(2)
          expect(result[0].name).toEqual(`The Mad Wax`)
        })
      })

      describe(`date`, () => {
        it(`filters date fields`, async () => {
          const [result] = await runFilter({ date: { ne: null } })

          expect(result.length).toEqual(2)
          expect(result[0].index).toEqual(0)
          expect(result[1].index).toEqual(2)
        })
      })
    })

    describe(`collection fields`, () => {
      it(`orders by given field desc with limit`, async () => {
        let result = await runQuery({
          limit: 10,
          sort: {
            fields: [`frontmatter.blue`],
            order: [`desc`],
          },
        })

        expect(result.length).toEqual(3)
        expect(result[0].id).toEqual(`1`)
        expect(result[1].id).toEqual(`2`)
        expect(result[2].id).toEqual(`0`)
      })

      describe(`num, null, and nullable order`, () => {
        // This suite asserts the order of a field that is a number vs a field that
        // is explicitly set to the value `null`, vs a field that is not set
        // (which gets NULL in the database). This should do whatever redux does!
        // Exhaustive suite; 2^3 x2 = 12 tests, all cases in asc and desc

        // node 1  2   3
        //  - num_null_not    1st node has field set, 2nd set to null, 3rd not set
        //  - num_not_null    etc
        //  - null_num_not
        //  - null_not_num
        //  - not_null_num
        //  - not_num_null

        it(`sorts num_null_not asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`num_null_not`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts num_null_not desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`num_null_not`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts num_not_null asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`num_not_null`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts num_not_null desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`num_not_null`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts null_num_not asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_num_not`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts null_num_not desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_num_not`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts null_not_num asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_not_num`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts null_not_num desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_not_num`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts not_null_num asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_null_num`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts not_null_num desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_null_num`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts not_num_null asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_num_null`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts not_num_null desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_num_null`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`1`)
        })
      })

      describe(`string, null, and nullable order`, () => {
        // This suite asserts the order of a field that is a string vs a field that
        // is explicitly set to the value `null`, vs a field that is not set
        // (which gets NULL in the database). This should do whatever redux does!
        // Exhaustive suite; 2^3 x2 = 12 tests, all cases in asc and desc

        // node 1  2   3
        //  - str_null_not    1st node has field set, 2nd set to null, 3rd not set
        //  - str_not_null    etc
        //  - null_str_not
        //  - null_not_str
        //  - not_null_str
        //  - not_str_null

        it(`sorts str_null_not asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`str_null_not`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts str_null_not desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`str_null_not`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts str_not_null asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`str_not_null`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts str_not_null desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`str_not_null`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts null_str_not asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_str_not`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts null_str_not desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_str_not`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts null_not_str asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_not_str`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts null_not_str desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_not_str`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts not_null_str asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_null_str`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts not_null_str desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_null_str`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts not_str_null asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_str_null`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts not_str_null desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_str_null`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`1`)
        })
      })

      describe(`obj, null, and nullable order`, () => {
        // This suite asserts the order of a field that is a object vs a field that
        // is explicitly set to the value `null`, vs a field that is not set
        // (which gets NULL in the database). This should do whatever redux does!
        // Exhaustive suite; 2^3 x2 = 12 tests, all cases in asc and desc

        // node 1  2   3
        //  - obj_null_not    1st node has field set, 2nd set to null, 3rd not set
        //  - obj_not_null    etc
        //  - null_obj_not
        //  - null_not_obj
        //  - not_null_obj
        //  - not_obj_null

        it(`sorts obj_null_not asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`obj_null_not`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts obj_null_not desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`obj_null_not`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts obj_not_null asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`obj_not_null`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts obj_not_null desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`obj_not_null`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts null_obj_not asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_obj_not`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts null_obj_not desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_obj_not`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts null_not_obj asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_not_obj`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`1`)
        })

        it(`sorts null_not_obj desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`null_not_obj`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`0`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts not_null_obj asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_null_obj`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`2`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts not_null_obj desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_null_obj`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`1`)
          expect(result[2].id).toEqual(`2`)
        })

        it(`sorts not_obj_null asc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_obj_null`],
              order: [`asc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`1`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`0`)
        })

        it(`sorts not_obj_null desc`, async () => {
          let result = await runQuery({
            sort: {
              fields: [`not_obj_null`],
              order: [`desc`],
            },
          })

          expect(result.length).toEqual(3)
          expect(result[0].id).toEqual(`0`)
          expect(result[1].id).toEqual(`2`)
          expect(result[2].id).toEqual(`1`)
        })
      })

      it(`sorts results with desc has null fields first vs obj second`, async () => {
        let result = await runQuery({
          limit: 10,
          sort: {
            fields: [`waxOnly`],
            order: [`desc`],
          },
        })

        // 0 doesnt have it, 1 has it as an object, 2 has it as null

        expect(result.length).toEqual(3)
        expect(result[0].id).toEqual(`0`)
        expect(result[1].id).toEqual(`2`)
        expect(result[2].id).toEqual(`1`)
      })

      it(`sorts results with asc has null fields last vs obj first`, async () => {
        let result = await runQuery({
          limit: 10,
          sort: {
            fields: [`waxOnly`],
            order: [`asc`],
          },
        })

        // 0 doesnt have it, 1 has it as an object, 2 has it as null

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
  })
})
