const { store } = require(`../../../redux`)
const { build } = require(`../..`)
require(`../../../db/__tests__/fixtures/ensure-loki`)()

const nodes = [
  {
    id: `id1`,
    internal: { type: `Test` },
    foo: true,
    conflictType: 1,
    conflictArray: [1],
    conflictArrayType: [1],
    conflictArrayReverse: 1,
    conflictScalar: { foo: true },
    conflictScalarReverse: 1,
    conflictScalarArray: [{ foo: true }],
    conflcitScalarArrayReverse: [1],
    nested: {
      foo: true,
      conflict: 1,
      nested: {
        foo: true,
        conflict: 1,
        extraExtra: true,
      },
    },
    nestedArray: [
      {
        foo: true,
        conflict: 1,
        extra: true,
        nested: { foo: true, conflict: 1, extraExtraExtra: true },
      },
    ],
  },
]

describe(`merges explicit and inferred type definitions`, () => {
  beforeAll(() => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )
  })

  const buildTestSchema = async ({
    infer = true,
    addDefaultResolvers = true,
  }) => {
    const inferDirective = infer ? `@infer` : `@dontInfer`
    const noDefaultResolvers = addDefaultResolvers ? `false` : `true`
    const typeDefs = [
      `
      type NestedNested {
        bar: Boolean!
        conflict: String!
        notExtra: Boolean
      }

      type Nested {
        bar: Boolean!
        conflict: String!
        nested: NestedNested
      }

      type Test implements Node ${inferDirective}(noDefaultResolvers: ${noDefaultResolvers}) {
        bar: Boolean!
        nested: Nested!
        nestedArray: [Nested!]!
        conflictType: String!
        conflictArray: Int!
        conflictArrayReverse: [Int!]!
        conflictArrayType: [String!]!
        conflictScalar: Int!
        conflictScalarReverse: Nested!
        conflictScalarArray: [Int!]!
        conflcitScalarArrayReverse: [Nested!]!
      }`,
    ]

    typeDefs.forEach(def =>
      store.dispatch({ type: `CREATE_TYPES`, payload: def })
    )

    await build({})
    return store.getState().schema
  }

  it(`with default strategy`, async () => {
    const schema = await buildTestSchema({})
    const fields = schema.getType(`Test`).getFields()
    const nestedFields = schema.getType(`Nested`).getFields()
    const nestedNestedFields = schema.getType(`NestedNested`).getFields()

    // Non-conflicting top-level fields added
    expect(fields.foo.type.toString()).toBe(`Boolean`)
    expect(fields.bar.type.toString()).toBe(`Boolean!`)

    // Non-conflicting fields added on nested type
    expect(fields.nested.type.toString()).toBe(`Nested!`)
    expect(fields.nestedArray.type.toString()).toBe(`[Nested!]!`)
    expect(nestedFields.foo.type.toString()).toBe(`Boolean`)
    expect(nestedFields.bar.type.toString()).toBe(`Boolean!`)
    expect(nestedNestedFields.foo.type.toString()).toBe(`Boolean`)
    expect(nestedNestedFields.bar.type.toString()).toBe(`Boolean!`)

    // When type is referenced more than once on typeDefs, all non-conflicting
    // fields are added
    expect(nestedFields.extra.type.toString()).toBe(`Boolean`)
    expect(nestedNestedFields.notExtra.type.toString()).toBe(`Boolean`)
    expect(nestedNestedFields.extraExtra.type.toString()).toBe(`Boolean`)
    expect(nestedNestedFields.extraExtraExtra.type.toString()).toBe(`Boolean`)

    // Explicit typeDefs have proprity in case of type conflict
    expect(fields.conflictType.type.toString()).toBe(`String!`)
    expect(fields.conflictArray.type.toString()).toBe(`Int!`)
    expect(fields.conflictArrayReverse.type.toString()).toBe(`[Int!]!`)
    expect(fields.conflictArrayType.type.toString()).toBe(`[String!]!`)
    expect(fields.conflictScalar.type.toString()).toBe(`Int!`)
    expect(fields.conflictScalarReverse.type.toString()).toBe(`Nested!`)
    expect(fields.conflictScalarArray.type.toString()).toBe(`[Int!]!`)
    expect(fields.conflcitScalarArrayReverse.type.toString()).toBe(`[Nested!]!`)

    // Explicit typeDefs have priority on nested types as well
    expect(nestedFields.conflict.type.toString()).toBe(`String!`)
    expect(nestedNestedFields.conflict.type.toString()).toBe(`String!`)
  })

  it.todo(`with @dontInfer directive`)

  it.todo(`with noDefaultResolvers: true`)

  it.todo(`with both @dontInfer and noDefaultResolvers: true`)

  // FIXME: Currently we don't do that
  it.todo(`warns in case of user-defined Node interface`)
})
