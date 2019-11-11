const { printSchema, printType, lexicographicSortSchema } = require(`graphql`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const {
  build,
  rebuildWithSitePage,
  rebuildWithTypes,
  getDirtyTypes,
} = require(`..`)
const { buildObjectType } = require(`../types/type-builders`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
    phantomActivity: () => {
      return {
        start: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

const reporter = require(`gatsby-cli/lib/reporter`)

const firstPage = () => {
  return {
    id: `page1`,
    parent: null,
    children: [],
    internal: { type: `SitePage`, contentDigest: `0`, counter: 0 },
    keep: `Page`,
    fields: {
      oldKey: `value`,
    },
  }
}

const secondPage = () => {
  return {
    id: `page2`,
    parent: null,
    children: [],
    internal: { type: `SitePage`, contentDigest: `0`, counter: 1 },
    fields: {
      key: `value`,
    },
    context: {
      key: `value`,
    },
  }
}

const nodes = () => [firstPage()]
const typePrinter = schema => typeName => printType(schema.getType(typeName))

const addNode = node => store.dispatch({ type: `CREATE_NODE`, payload: node })
const deleteNode = node =>
  store.dispatch({ type: `DELETE_NODE`, payload: node })

const createParentChildLink = ({ parent, child }) =>
  store.dispatch(actions.createParentChildLink({ parent, child }))

const addNodeField = ({ node, name, value }) => {
  node.fields = node.fields || {}
  node.fields[name] = value
  store.dispatch({
    type: `ADD_FIELD_TO_NODE`,
    payload: node,
    addedField: name,
  })
}

const rebuildTestSchema = async () => {
  await rebuildWithTypes({ typeNames: getDirtyTypes() })
  return store.getState().schema
}

const addNodeAndRebuild = async node => {
  const nodes = Array.isArray(node) ? node : [node]
  nodes.forEach(addNode)
  return await rebuildTestSchema()
}

const deleteNodeAndRebuild = async node => {
  const nodes = Array.isArray(node) ? node : [node]
  nodes.forEach(deleteNode)
  return await rebuildTestSchema()
}

describe(`build and update schema for SitePage`, () => {
  let schema

  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes().forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )

    await build({})
    schema = store.getState().schema
  })

  it(`updates SitePage on rebuild`, async () => {
    let fields
    let inputFields

    const initialFields = [
      `id`,
      `parent`,
      `children`,
      `internal`,
      `keep`,
      `fields`,
    ]

    fields = Object.keys(schema.getType(`SitePage`).getFields())
    expect(fields.length).toBe(6)
    expect(fields).toEqual(initialFields)

    inputFields = Object.keys(schema.getType(`SitePageFilterInput`).getFields())
    expect(fields.length).toBe(6)
    expect(inputFields).toEqual(initialFields)

    // Rebuild Schema
    store.dispatch({ type: `CREATE_NODE`, payload: secondPage() })
    await rebuildWithSitePage({})
    schema = store.getState().schema

    fields = Object.keys(schema.getType(`SitePage`).getFields())
    expect(fields.length).toBe(7)
    expect(fields).toEqual(initialFields.concat(`context`))

    inputFields = Object.keys(schema.getType(`SitePageFilterInput`).getFields())
    expect(fields.length).toBe(7)
    expect(inputFields).toEqual(initialFields.concat(`context`))

    const fieldsEnum = schema
      .getType(`SitePageFieldsEnum`)
      .getValue(`context___key`)
    expect(fieldsEnum).toBeDefined()

    const sortFieldsEnum = schema.getType(`SitePageSortInput`).getFields()
      .fields.type.ofType
    expect(sortFieldsEnum.getValue(`context___key`)).toBeDefined()
  })

  it(`updates nested types on rebuild`, async () => {
    let fields
    let inputFields

    fields = Object.keys(schema.getType(`SitePageFields`).getFields())
    expect(fields.length).toBe(1)
    expect(fields).toEqual([`oldKey`])
    inputFields = Object.keys(
      schema.getType(`SitePageFieldsFilterInput`).getFields()
    )
    expect(inputFields.length).toBe(1)
    expect(inputFields).toEqual([`oldKey`])

    // Rebuild Schema
    store.dispatch({ type: `CREATE_NODE`, payload: secondPage() })
    await rebuildWithSitePage({})
    schema = store.getState().schema

    fields = Object.keys(schema.getType(`SitePageFields`).getFields())
    expect(fields.length).toBe(2)
    expect(fields).toEqual([`oldKey`, `key`])

    inputFields = Object.keys(
      schema.getType(`SitePageFieldsFilterInput`).getFields()
    )
    expect(inputFields.length).toBe(2)
    expect(inputFields).toEqual([`oldKey`, `key`])

    const fieldsEnum = schema
      .getType(`SitePageFieldsEnum`)
      .getValues()
      .map(value => value.name)
    expect(fieldsEnum.includes(`fields___oldKey`)).toBeTruthy()
    expect(fieldsEnum.includes(`fields___key`)).toBeTruthy()
  })
})

describe(`build and update schema for other types`, () => {
  const createNodes = () => [
    {
      id: `Foo1`,
      internal: { type: `Foo`, contentDigest: `0` },
      children: [],
      numberKey: 1,
      stringKey: `5`,
      dateKey: `2018-05-05`,
    },
    {
      id: `Nested1`,
      internal: { type: `Nested`, contentDigest: `0` },
      children: [],
      nested: {
        foo: { bar: { baz: `string` } },
      },
    },
  ]

  const initialFooFields = [
    `id`,
    `parent`,
    `children`,
    `internal`,
    `numberKey`,
    `stringKey`,
    `dateKey`,
  ]

  let schema
  let initialPrintedSchema
  let initialTypes
  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    createNodes().forEach(addNode)

    await build({})
    schema = store.getState().schema
    initialTypes = Object.keys(schema.getTypeMap()).sort()
    initialPrintedSchema = printSchema(lexicographicSortSchema(schema))
  })

  const expectSymmetricDelete = async node => {
    const newSchema = await deleteNodeAndRebuild(node)
    const printed = printSchema(lexicographicSortSchema(newSchema))
    expect(printed).toEqual(initialPrintedSchema)
    return newSchema
  }

  it(`changes type when fields are added or removed`, async () => {
    const node = {
      id: `Foo2`,
      internal: { type: `Foo`, contentDigest: `0` },
      newField: 1,
    }
    const newSchema = await addNodeAndRebuild(node)

    const fooFields = newSchema.getType(`Foo`).getFields()
    expect(Object.keys(fooFields)).toEqual(initialFooFields.concat(`newField`))
    expect(fooFields.newField.type.name).toEqual(`Int`)

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(initialTypes)

    await expectSymmetricDelete(node)
  })

  it(`doesn't change type when node structure remains the same`, async () => {
    const node = {
      id: `Foo2`,
      internal: { type: `Foo`, contentDigest: `0` },
      numberKey: 2,
    }
    const newSchema = await addNodeAndRebuild(node)

    const fooFields = newSchema.getType(`Foo`).getFields()
    expect(Object.keys(fooFields)).toEqual(initialFooFields)

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(initialTypes)

    await expectSymmetricDelete(node)
  })

  it(`changes field type from Int to Float when node has mixed values`, async () => {
    const node = {
      id: `Foo2`,
      internal: { type: `Foo`, contentDigest: `0` },
      numberKey: 0.5,
    }
    const newSchema = await addNodeAndRebuild(node)

    const fields = newSchema.getType(`Foo`).getFields()
    expect(fields.numberKey.type.name).toEqual(`Float`)

    const expectRemoved = [`IntQueryOperatorInput`]
    const expectAdded = [`Float`, `FloatQueryOperatorInput`]
    const newExpectedTypes = initialTypes
      .filter(type => !expectRemoved.includes(type))
      .concat(expectAdded)
      .sort()

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(newExpectedTypes)

    await expectSymmetricDelete(node)
  })

  it(`creates new type when node of a new type is added`, async () => {
    const node = {
      id: `Bar1`,
      internal: { type: `Bar`, contentDigest: `0` },
      numberKey: 1,
    }
    const newSchema = await addNodeAndRebuild(node)
    expect(newSchema.getType(`Bar`)).toBeDefined()

    const print = typePrinter(newSchema)
    expect(print(`Bar`)).toMatchInlineSnapshot(`
      "type Bar implements Node {
        id: ID!
        parent: Node
        children: [Node!]!
        internal: Internal!
        numberKey: Int
      }"
    `)

    await expectSymmetricDelete(node)
  })

  it(`creates nested types`, async () => {
    const node = {
      id: `Foo2`,
      internal: { type: `Foo`, contentDigest: `0` },
      fields: {
        bar: { baz: `baz` },
        baz: [[{ foo: `1` }, { bar: 5 }], [{ foobar: true }]],
      },
    }
    const newSchema = await addNodeAndRebuild(node)
    expect(newSchema.getType(`FooFields`)).toBeDefined()
    expect(newSchema.getType(`FooFieldsBar`)).toBeDefined()
    expect(newSchema.getType(`FooFieldsBaz`)).toBeDefined()

    const print = typePrinter(newSchema)

    expect(print(`FooFields`)).toMatchInlineSnapshot(`
      "type FooFields {
        bar: FooFieldsBar
        baz: [[FooFieldsBaz]]
      }"
    `)
    expect(print(`FooFieldsBar`)).toMatchInlineSnapshot(`
      "type FooFieldsBar {
        baz: String
      }"
    `)
    expect(print(`FooFieldsBaz`)).toMatchInlineSnapshot(`
      "type FooFieldsBaz {
        foo: String
        bar: Int
        foobar: Boolean
      }"
    `)

    await expectSymmetricDelete(node)
  })

  it(`creates nested types within existing nested types`, async () => {
    const node = {
      id: `Nested2`,
      internal: { type: `Nested`, contentDigest: `0` },
      nested: {
        foo: { another: { bar: `baz` } },
      },
    }
    const newSchema = await addNodeAndRebuild(node)

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(
      initialTypes
        .concat([`NestedNestedFooAnother`, `NestedNestedFooAnotherFilterInput`])
        .sort()
    )

    const print = typePrinter(newSchema)

    expect(print(`NestedNestedFoo`)).toMatchInlineSnapshot(`
      "type NestedNestedFoo {
        bar: NestedNestedFooBar
        another: NestedNestedFooAnother
      }"
    `)
    expect(print(`NestedNestedFooAnother`)).toMatchInlineSnapshot(`
      "type NestedNestedFooAnother {
        bar: String
      }"
    `)
    expect(print(`NestedNestedFooAnotherFilterInput`)).toMatchInlineSnapshot(`
      "input NestedNestedFooAnotherFilterInput {
        bar: StringQueryOperatorInput
      }"
    `)

    await expectSymmetricDelete(node)
  })

  it(`creates ___NODE relations on new types`, async () => {
    const node = {
      id: `Bar1`,
      internal: { type: `Bar`, contentDigest: `0` },
      related___NODE: `Foo1`,
    }
    const newSchema = await addNodeAndRebuild(node)
    const print = typePrinter(newSchema)

    expect(print(`Bar`)).toMatchInlineSnapshot(`
      "type Bar implements Node {
        id: ID!
        parent: Node
        children: [Node!]!
        internal: Internal!
        related: Foo
      }"
    `)

    await expectSymmetricDelete(node)
  })

  it(`creates ___NODE relations on updated types`, async () => {
    const node = {
      id: `Foo2`,
      internal: { type: `Foo`, contentDigest: `0` },
      related___NODE: `Foo1`,
    }
    const newSchema = await addNodeAndRebuild(node)

    const fields = newSchema.getType(`Foo`).getFields()
    expect(Object.keys(fields)).toEqual(initialFooFields.concat(`related`))
    expect(fields.related.type.name).toEqual(`Foo`)

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(initialTypes)

    await expectSymmetricDelete(node)
  })

  it(`creates derived types`, async () => {
    const node = {
      id: `Bar1`,
      internal: { type: `Bar`, contentDigest: `0` },
      fields: {
        field1: `test`,
      },
    }
    const newSchema = await addNodeAndRebuild(node)

    const expectedNewTypes = [
      `Bar`,
      `BarFieldsFilterInput`,
      `BarFields`,
      `BarFilterInput`,
      `BarSortInput`,
      `BarFieldsEnum`,
      `BarConnection`,
      `BarEdge`,
      `BarGroupConnection`,
    ]

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(initialTypes.concat(expectedNewTypes).sort())

    const print = typePrinter(newSchema)

    expect(print(`BarFields`)).toMatchInlineSnapshot(`
      "type BarFields {
        field1: String
      }"
    `)
    expect(print(`BarFieldsFilterInput`)).toMatchInlineSnapshot(`
      "input BarFieldsFilterInput {
        field1: StringQueryOperatorInput
      }"
    `)
    expect(print(`BarFilterInput`)).toMatchInlineSnapshot(`
      "input BarFilterInput {
        id: StringQueryOperatorInput
        parent: NodeFilterInput
        children: NodeFilterListInput
        internal: InternalFilterInput
        fields: BarFieldsFilterInput
      }"
    `)
    expect(print(`BarSortInput`)).toMatchInlineSnapshot(`
      "input BarSortInput {
        fields: [BarFieldsEnum]
        order: [SortOrderEnum] = [ASC]
      }"
    `)
    expect(print(`BarEdge`)).toMatchInlineSnapshot(`
      "type BarEdge {
        next: Bar
        node: Bar!
        previous: Bar
      }"
    `)
    expect(print(`BarConnection`)).toMatchInlineSnapshot(`
      "type BarConnection {
        totalCount: Int!
        edges: [BarEdge!]!
        nodes: [Bar!]!
        pageInfo: PageInfo!
        distinct(field: BarFieldsEnum!): [String!]!
        group(skip: Int, limit: Int, field: BarFieldsEnum!): [BarGroupConnection!]!
      }"
    `)
    expect(print(`BarGroupConnection`)).toMatchInlineSnapshot(`
      "type BarGroupConnection {
        totalCount: Int!
        edges: [BarEdge!]!
        nodes: [Bar!]!
        pageInfo: PageInfo!
        field: String!
        fieldValue: String
      }"
    `)
    expect(print(`BarFieldsEnum`)).toMatchSnapshot()

    await expectSymmetricDelete(node)
  })

  it(`creates derived types for nested fields`, async () => {
    const node = {
      id: `Nested2`,
      internal: { type: `Nested`, contentDigest: `0` },
      nested: {
        foo: { baz: { deep: false } },
      },
    }
    const newSchema = await addNodeAndRebuild(node)

    const expectedNewTypes = [
      `NestedNestedFooBaz`,
      `NestedNestedFooBazFilterInput`,
    ]

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(initialTypes.concat(expectedNewTypes).sort())

    const print = typePrinter(newSchema)
    expect(print(`NestedNestedFooBaz`)).toMatchInlineSnapshot(`
      "type NestedNestedFooBaz {
        deep: Boolean
      }"
    `)
    expect(print(`NestedNestedFooBazFilterInput`)).toMatchInlineSnapshot(`
      "input NestedNestedFooBazFilterInput {
        deep: BooleanQueryOperatorInput
      }"
    `)

    await expectSymmetricDelete(node)
  })

  it(`adds child convenience field on parent type`, async () => {
    const nodes = [
      {
        id: `Bar1`,
        internal: { type: `Bar`, contentDigest: `0` },
        parent: `Foo1`,
        value: 0,
      },
      {
        id: `Baz1`,
        internal: { type: `Baz`, contentDigest: `0` },
        parent: `Foo1`,
        value: 0,
      },
    ]
    const parent = createNodes()[0]
    nodes.forEach(node => {
      addNode(node)
      createParentChildLink({ parent, child: node })
    })
    const newSchema = await rebuildTestSchema()

    const fields = newSchema.getType(`Foo`).getFields()
    const fieldNames = Object.keys(fields).sort()
    expect(fieldNames).toEqual(
      initialFooFields.concat(`childBar`, `childBaz`).sort()
    )
    expect(String(fields.childBar.type)).toEqual(`Bar`)
    expect(String(fields.childBaz.type)).toEqual(`Baz`)

    await expectSymmetricDelete(nodes)
  })

  it(`adds children convenience field on parent type`, async () => {
    const nodes = [
      {
        id: `Bar1`,
        internal: { type: `Bar`, contentDigest: `0` },
        parent: `Foo1`,
        value: 0,
      },
      {
        id: `Bar2`,
        internal: { type: `Bar`, contentDigest: `0` },
        parent: `Foo1`,
        value: 0,
      },
    ]
    const parent = createNodes()[0]
    nodes.forEach(node => {
      addNode(node)
      createParentChildLink({ parent, child: node })
    })
    const newSchema = await rebuildTestSchema()

    const fields = newSchema.getType(`Foo`).getFields()
    const fieldNames = Object.keys(fields).sort()
    expect(fieldNames).toEqual(initialFooFields.concat(`childrenBar`).sort())
    expect(String(fields.childrenBar.type)).toEqual(`[Bar]`)

    await expectSymmetricDelete(nodes)
  })

  it(`creates new fields on ADD_FIELD_TO_NODE`, async () => {
    const node = createNodes()[1]

    addNodeField({
      node,
      name: `added`,
      value: `foo`,
    })

    const newSchema = await rebuildTestSchema()
    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(
      initialTypes.concat([`NestedFields`, `NestedFieldsFilterInput`]).sort()
    )

    const print = typePrinter(newSchema)
    expect(print(`NestedFields`)).toMatchInlineSnapshot(`
      "type NestedFields {
        added: String
      }"
    `)
    expect(print(`NestedFieldsFilterInput`)).toMatchInlineSnapshot(`
      "input NestedFieldsFilterInput {
        added: StringQueryOperatorInput
      }"
    `)
  })

  it(`creates new nested fields on ADD_FIELD_TO_NODE`, async () => {
    const node = createNodes()[1]

    addNodeField({
      node,
      name: `added`,
      value: [[{ nested: `str` }, { int: 5 }], [{ bool: true }]],
    })

    const newSchema = await rebuildTestSchema()
    const types = Object.keys(newSchema.getTypeMap()).sort()
    const expectedNewTypes = [
      `NestedFields`,
      `NestedFieldsFilterInput`,
      `NestedFieldsAdded`,
      `NestedFieldsAddedFilterInput`,
      `NestedFieldsAddedFilterListInput`,
    ]

    expect(types).toEqual(initialTypes.concat(expectedNewTypes).sort())

    const print = typePrinter(newSchema)
    expect(print(`NestedFields`)).toMatchInlineSnapshot(`
      "type NestedFields {
        added: [[NestedFieldsAdded]]
      }"
    `)
    expect(print(`NestedFieldsAdded`)).toMatchInlineSnapshot(`
      "type NestedFieldsAdded {
        nested: String
        int: Int
        bool: Boolean
      }"
    `)
    expect(print(`NestedFieldsFilterInput`)).toMatchInlineSnapshot(`
      "input NestedFieldsFilterInput {
        added: NestedFieldsAddedFilterListInput
      }"
    `)
    expect(print(`NestedFieldsAddedFilterListInput`)).toMatchInlineSnapshot(`
      "input NestedFieldsAddedFilterListInput {
        elemMatch: NestedFieldsAddedFilterInput
      }"
    `)
    expect(print(`NestedFieldsAddedFilterInput`)).toMatchInlineSnapshot(`
      "input NestedFieldsAddedFilterInput {
        nested: StringQueryOperatorInput
        int: IntQueryOperatorInput
        bool: BooleanQueryOperatorInput
      }"
    `)
  })

  it(`applies automatic extensions to inferred fields`, async () => {
    const node = {
      id: `NewType1`,
      internal: { type: `NewType`, contentDigest: `0` },
      date: `2019-09-09`,
      nested: {
        date: `2019-09-09`,
        nested: {
          date: `2019-09-09`,
        },
      },
    }
    const newSchema = await addNodeAndRebuild(node)

    const print = typePrinter(newSchema)
    expect(print(`NewType`)).toMatchSnapshot()
    expect(print(`NewTypeNested`)).toMatchSnapshot()
    expect(print(`NewTypeNestedNested`)).toMatchSnapshot()

    expectSymmetricDelete(node)
  })

  it(`deletes deeply nested fields on child nodes`, async () => {
    const nodes = createNodes()
    const child = () => {
      return {
        id: `Nested2`,
        parent: nodes[0].id,
        internal: { type: `Nested`, contentDigest: `0` },
        children: [],
        nested: {
          foo: { bar: { baz: `string`, test: `test` } },
        },
      }
    }
    addNode(child())
    createParentChildLink({ parent: nodes[0], child: child() })

    let schema = await rebuildTestSchema()
    expect(typePrinter(schema)(`NestedNestedFooBar`)).toMatchInlineSnapshot(`
      "type NestedNestedFooBar {
        baz: String
        test: String
      }"
    `)

    schema = await expectSymmetricDelete(child())
    expect(typePrinter(schema)(`NestedNestedFooBar`)).toMatchInlineSnapshot(`
      "type NestedNestedFooBar {
        baz: String
      }"
    `)
  })

  describe(`conflict reporting`, () => {
    const clearMocks = () => {
      reporter.warn.mockClear()
      reporter.log.mockClear()
    }

    beforeEach(clearMocks)

    const conflictingNode = () => {
      return {
        id: `Foo2`,
        internal: { type: `Foo`, contentDigest: `0` },
        children: [],
        numberKey: `string`,
        dateKey: { nowItsObject: true },
      }
    }

    it(`should remove conflicting fields and report about conflict`, async () => {
      const newSchema = await addNodeAndRebuild(conflictingNode())
      const print = typePrinter(newSchema)

      expect(print(`Foo`)).toMatchInlineSnapshot(`
        "type Foo implements Node {
          id: ID!
          parent: Node
          children: [Node!]!
          internal: Internal!
          stringKey: String
        }"
      `)

      expect(reporter.warn).toMatchSnapshot()
      expect(reporter.log).toMatchSnapshot()
    })

    it(`should restore fields when conflicts are resolved`, async () => {
      await addNodeAndRebuild(conflictingNode())
      clearMocks()

      const newSchema = await deleteNodeAndRebuild(conflictingNode())
      const printed = printSchema(lexicographicSortSchema(newSchema))
      expect(printed).toEqual(initialPrintedSchema)

      expect(reporter.warn).not.toHaveBeenCalled()
      expect(reporter.log).not.toHaveBeenCalled()
    })
  })
})

describe(`compatibility with schema customization API`, () => {
  let schema

  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })

    store.dispatch(
      actions.createTypes([
        `
          type Foo @infer {
            foo: Int
          }
          type FooFieldsBar @infer {
            bar: String
          }
          type FooFieldsBaz @dontInfer {
            baz: String
          }
          type Bar @dontInfer {
            bar: String
          }
          type Query {
            foo: Foo
            bar: Bar
          }
        `,
        buildObjectType({
          name: `Baz`,
          fields: {
            baz: `Int!`,
          },
          extensions: {
            infer: true,
          },
        }),
        buildObjectType({
          name: `BarBaz`,
          fields: {
            barBaz: `String`,
          },
          extensions: {
            infer: false,
          },
        }),
      ])
    )
    await build({})
    schema = store.getState().schema
  })

  it(`should rebuild types with inference enabled and keep explicit schema in place`, async () => {
    const newSchema = await addNodeAndRebuild([
      {
        id: `Foo1`,
        internal: { type: `Foo`, contentDigest: `0` },
        children: [],
        foo: `foo`,
        bar: `bar`,
        fields: {
          bar: {
            bar: 1,
            foo: `str`,
          },
        },
      },
      {
        id: `Baz1`,
        internal: { type: `Baz`, contentDigest: `0` },
        children: [],
        baz: `foo`,
        bar: `bar`,
      },
    ])

    const print = typePrinter(newSchema)
    expect(print(`Foo`)).toMatchInlineSnapshot(`
      "type Foo {
        foo: Int
        bar: String
        fields: FooFields
      }"
    `)

    expect(print(`FooFields`)).toMatchInlineSnapshot(`
      "type FooFields {
        bar: FooFieldsBar
      }"
    `)

    expect(print(`FooFieldsBar`)).toMatchInlineSnapshot(`
      "type FooFieldsBar {
        bar: String
        foo: String
      }"
    `)

    expect(print(`Baz`)).toMatchInlineSnapshot(`
      "type Baz {
        baz: Int!
        bar: String
      }"
    `)
  })

  it(`should not rebuild types with inference disabled`, async () => {
    const newSchema = await addNodeAndRebuild([
      {
        id: `Foo1`,
        internal: { type: `Foo`, contentDigest: `0` },
        children: [],
        bar: `bar`,
        fields: {
          baz: {
            foo: 1,
            bar: `str`,
          },
        },
      },
      {
        id: `Bar1`,
        internal: { type: `Bar`, contentDigest: `0` },
        children: [],
        foo: 5,
        bar: 5,
        baz: `str`,
      },
      {
        id: `BarBaz1`,
        internal: { type: `BarBaz`, contentDigest: `0` },
        children: [],
        baz: `foo`,
        bar: `bar`,
      },
    ])

    const print = typePrinter(newSchema)

    expect(print(`FooFieldsBaz`)).toMatchInlineSnapshot(`
      "type FooFieldsBaz {
        baz: String
      }"
    `)

    expect(print(`Bar`)).toMatchInlineSnapshot(`
      "type Bar {
        bar: String
      }"
    `)

    expect(print(`BarBaz`)).toMatchInlineSnapshot(`
      "type BarBaz {
        barBaz: String
      }"
    `)
  })

  it(`should not collect inference metadata for types with inference disabled`, async () => {
    const { inferenceMetadata } = store.getState()
    const typesToIgnore = Object.keys(inferenceMetadata).filter(
      type => inferenceMetadata[type].ignored
    )
    expect(typesToIgnore).toEqual([`FooFieldsBaz`, `Bar`, `BarBaz`])
  })
})
