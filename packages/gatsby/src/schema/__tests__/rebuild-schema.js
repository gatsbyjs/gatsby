const {
  graphql,
  printSchema,
  printType,
  lexicographicSortSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} = require(`graphql`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { build, rebuild } = require(`..`)
const { buildObjectType } = require(`../types/type-builders`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

jest.mock(`../../utils/api-runner-node`)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
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
const typePrinter = schema => typeName => printType(schema.getType(typeName))

const addNode = node => store.dispatch({ type: `CREATE_NODE`, payload: node })
const updateNode = (node, oldNode) =>
  store.dispatch({ type: `CREATE_NODE`, payload: node, oldNode })
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
  await rebuild({})
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

const createExternalSchema = () => {
  const query = new GraphQLObjectType({
    name: `Query`,
    fields: {
      external: {
        type: new GraphQLObjectType({
          name: `ExternalType`,
          fields: {
            externalFoo: {
              type: GraphQLString,
              resolve: parentValue =>
                `${parentValue}.ExternalType.externalFoo.defaultResolver`,
            },
          },
        }),
        resolve: () => `Query.external`,
      },
      external2: {
        type: GraphQLString,
        resolve: () => `Query.external2`,
      },
    },
  })
  return new GraphQLSchema({ query })
}

describe(`build and update individual types`, () => {
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
    expect(String(fooFields.newField.type)).toEqual(`Int`)

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
    expect(String(fields.numberKey.type)).toEqual(`Float`)

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
    expect(String(fields.related.type)).toEqual(`Foo`)

    const types = Object.keys(newSchema.getTypeMap()).sort()
    expect(types).toEqual(initialTypes)

    await expectSymmetricDelete(node)
  })

  it(`changes ___NODE relations (defined as array) from object type to union and back`, async () => {
    const node = {
      id: `Bar1`,
      internal: { type: `Bar`, contentDigest: `0` },
      related___NODE: [`Foo1`],
    }
    let newSchema = await addNodeAndRebuild(node)
    let field = newSchema.getType(`Bar`).getFields().related
    expect(String(field.type)).toEqual(`[Foo]`)

    const node2 = {
      id: `Bar2`,
      internal: { type: `Bar`, contentDigest: `0` },
      related___NODE: [`Nested1`],
    }
    newSchema = await addNodeAndRebuild(node2)
    field = newSchema.getType(`Bar`).getFields().related
    expect(String(field.type)).toEqual(`[FooNestedUnion]`)

    newSchema = await deleteNodeAndRebuild(node2)
    field = newSchema.getType(`Bar`).getFields().related
    expect(String(field.type)).toEqual(`[Foo]`)
  })

  it(`changes ___NODE relations (defined as string) from object type to union and back`, async () => {
    const node = {
      id: `Bar1`,
      internal: { type: `Bar`, contentDigest: `0` },
      related___NODE: `Foo1`,
    }
    let newSchema = await addNodeAndRebuild(node)
    let field = newSchema.getType(`Bar`).getFields().related
    expect(String(field.type)).toEqual(`Foo`)

    const node2 = {
      id: `Bar2`,
      internal: { type: `Bar`, contentDigest: `0` },
      related___NODE: `Nested1`,
    }
    newSchema = await addNodeAndRebuild(node2)
    field = newSchema.getType(`Bar`).getFields().related
    expect(String(field.type)).toEqual(`FooNestedUnion`)

    newSchema = await deleteNodeAndRebuild(node2)
    field = newSchema.getType(`Bar`).getFields().related
    expect(String(field.type)).toEqual(`Foo`)
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

  it(`removes types on DELETE_NODES`, async () => {
    const schema = await addNodeAndRebuild({
      id: `Bar1`,
      internal: { type: `Bar`, contentDigest: `0` },
      children: [],
      bar: 5,
    })
    expect(schema.getType(`Foo`)).toBeDefined()
    expect(schema.getType(`Bar`)).toBeDefined()

    store.dispatch(actions.deleteNodes([`Foo1`, `Bar1`]))
    const newSchema = await rebuildTestSchema()
    expect(newSchema.getType(`Foo`)).not.toBeDefined()
    expect(newSchema.getType(`Bar`)).not.toBeDefined()
  })

  it(`removes fields on DELETE_NODES`, async () => {
    let schema = await addNodeAndRebuild([
      {
        id: `Foo2`,
        internal: { type: `Foo`, contentDigest: `0` },
        children: [],
        newKey1: `str`,
      },
      {
        id: `Foo3`,
        internal: { type: `Foo`, contentDigest: `0` },
        children: [],
        newKey2: `str`,
      },
    ])
    let fooFields = Object.keys(schema.getType(`Foo`).getFields())
    expect(fooFields).toEqual(initialFooFields.concat([`newKey1`, `newKey2`]))

    store.dispatch(actions.deleteNodes([`Foo2`, `Foo3`]))

    schema = await rebuildTestSchema()
    fooFields = Object.keys(schema.getType(`Foo`).getFields())
    expect(fooFields).toEqual(initialFooFields)
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

    await expectSymmetricDelete(node)
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

  it(`works with node updates`, async () => {
    const node = {
      id: `Foo1`,
      internal: { type: `Foo`, contentDigest: `0` },
      children: [],
      test: `test`,
    }
    const oldNode = createNodes()[0]
    updateNode(node, oldNode)
    const schema = await rebuildTestSchema()
    expect(typePrinter(schema)(`Foo`)).toMatchInlineSnapshot(`
      "type Foo implements Node {
        id: ID!
        parent: Node
        children: [Node!]!
        internal: Internal!
        test: String
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

describe(`rebuilds node types having existing relations`, () => {
  let schema
  let i

  const setup = async nodes => {
    i = 0
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(addNode)

    await build({})
    schema = store.getState().schema
  }

  const rebuild = async nodes => {
    i++
    nodes.forEach(node => {
      // Adding new field to enforce type structure change
      node[`field${i}`] = i
      node.id = `${node.id}${i}`
    })
    schema = await addNodeAndRebuild(nodes)
    return schema
  }

  it(`rebuilds simple acyclic relations`, async () => {
    const nodes = (...ids) =>
      [
        {
          id: `Foo1`,
          internal: { type: `Foo`, contentDigest: `0` },
          children: [],
          foo: `string`,
        },
        {
          id: `Bar1`,
          internal: { type: `Bar`, contentDigest: `0` },
          children: [],
          bar: 5,
        },
        {
          id: `Baz1`,
          internal: { type: `Baz`, contentDigest: `0` },
          children: [],
          baz: 7,
          bar___NODE: `Bar1`,
        },
      ].filter(node => !ids.length || ids.includes(node.id))

    await setup(nodes())
    await expect(rebuild(nodes(`Baz1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Bar1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Foo1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Foo1`, `Bar1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Bar1`, `Foo1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Baz1`, `Foo1`))).resolves.toBeDefined()

    // Make sure types were actually rebuilt (having all those field1, field2, etc)
    const print = typePrinter(schema)
    expect(print(`Foo`)).toMatchSnapshot()
    expect(print(`Bar`)).toMatchSnapshot()
    expect(print(`Baz`)).toMatchSnapshot()
  })

  it(`rebuilds self-cyclic relations`, async () => {
    const nodes = (...ids) =>
      [
        {
          id: `Foo1`,
          internal: { type: `Foo`, contentDigest: `0` },
          children: [],
          foo___NODE: `Foo2`,
        },
        {
          id: `Foo2`,
          internal: { type: `Foo`, contentDigest: `0` },
          children: [],
        },
      ].filter(node => !ids.length || ids.includes(node.id))

    await setup(nodes())
    await expect(rebuild(nodes(`Foo1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Foo2`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Foo1`, `Foo2`))).resolves.toBeDefined()

    const print = typePrinter(schema)
    expect(print(`Foo`)).toMatchSnapshot()
  })

  it(`rebuilds bi-directional relations`, async () => {
    const nodes = (...ids) =>
      [
        {
          id: `Foo1`,
          internal: { type: `Foo`, contentDigest: `0` },
          children: [],
          bar___NODE: `Bar1`,
        },
        {
          id: `Bar1`,
          internal: { type: `Bar`, contentDigest: `0` },
          children: [],
          foo___NODE: `Foo1`,
        },
      ].filter(node => !ids.length || ids.includes(node.id))

    await setup(nodes())
    await expect(rebuild(nodes(`Foo1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Bar1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Foo1`, `Bar1`))).resolves.toBeDefined()

    const print = typePrinter(schema)
    expect(print(`Foo`)).toMatchSnapshot()
    expect(print(`Bar`)).toMatchSnapshot()
  })

  it(`rebuilds cyclic relations`, async () => {
    const nodes = (...ids) =>
      [
        {
          id: `Foo1`,
          internal: { type: `Foo`, contentDigest: `0` },
          children: [],
          bar___NODE: `Bar1`,
        },
        {
          id: `Bar1`,
          internal: { type: `Bar`, contentDigest: `0` },
          children: [],
          baz___NODE: `Baz1`,
        },
        {
          id: `Baz1`,
          internal: { type: `Baz`, contentDigest: `0` },
          children: [],
          foo___NODE: `Foo1`,
        },
      ].filter(node => !ids.length || ids.includes(node.id))

    await setup(nodes())
    await expect(rebuild(nodes(`Foo1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Bar1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Baz1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Foo1`, `Bar1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Bar1`, `Foo1`))).resolves.toBeDefined()
    await expect(rebuild(nodes(`Baz1`, `Foo1`))).resolves.toBeDefined()

    // Make sure types were actually rebuilt (having all those field1, field2, etc)
    const print = typePrinter(schema)
    expect(print(`Foo`)).toMatchSnapshot()
    expect(print(`Bar`)).toMatchSnapshot()
    expect(print(`Baz`)).toMatchSnapshot()
  })
})

describe(`compatibility with createTypes`, () => {
  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })

    store.dispatch(
      actions.createTypes([
        `
          type Foo implements Node @infer {
            foo: Int
          }
          type FooFieldsBar @infer {
            bar: String
          }
          type FooFieldsBaz @dontInfer {
            baz: String
          }
          type Bar implements Node @dontInfer {
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
          interfaces: [`Node`],
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
      "type Foo implements Node {
        foo: Int
        bar: String
        fields: FooFields
        id: ID!
        parent: Node
        children: [Node!]!
        internal: Internal!
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
      "type Baz implements Node {
        baz: Int!
        bar: String
        id: ID!
        parent: Node
        children: [Node!]!
        internal: Internal!
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
      "type Bar implements Node {
        bar: String
        id: ID!
        parent: Node
        children: [Node!]!
        internal: Internal!
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
    const typesToIgnore = Object.keys(inferenceMetadata.typeMap).filter(
      type => inferenceMetadata.typeMap[type].ignored
    )
    expect(typesToIgnore).toEqual([`FooFieldsBaz`, `Bar`, `BarBaz`])
  })
})

describe(`Compatibility with addThirdPartySchema`, () => {
  const createNodes = () => [
    {
      id: `Foo1`,
      internal: { type: `Foo`, contentDigest: `0` },
      children: [],
      field: `5`,
    },
  ]

  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    store.dispatch(
      actions.addThirdPartySchema({ schema: createExternalSchema() })
    )
    mockCreateResolvers({
      ExternalType: {
        foo: {
          type: `Foo`,
          args: { fooArg: { type: `String` } },
          resolve(value, args) {
            return {
              field: args.fooArg,
            }
          },
        },
        externalFoo: {
          args: { injectedFooArg: { type: `String` } },
          resolve(value, args, context, info) {
            const original = info.originalResolver(value, args, context, info)
            return args.injectedFooArg + `(${original})`
          },
        },
      },
    })
    createNodes().forEach(addNode)
    await build({})
  })

  it(`rebuilds after third party schema is extended with createResolvers`, async () => {
    const newSchema = await rebuildTestSchema()

    const print = typePrinter(newSchema)
    expect(print(`Query`)).toMatchInlineSnapshot(`
      "type Query {
        foo(id: StringQueryOperatorInput, parent: NodeFilterInput, children: NodeFilterListInput, internal: InternalFilterInput, field: StringQueryOperatorInput): Foo
        allFoo(filter: FooFilterInput, sort: FooSortInput, skip: Int, limit: Int): FooConnection!
        external: ExternalType
        external2: String
      }"
    `)
    expect(print(`ExternalType`)).toMatchInlineSnapshot(`
      "type ExternalType {
        externalFoo(injectedFooArg: String): String
        foo(fooArg: String): Foo
      }"
    `)

    // Expect resolvers to be overridden by createResolvers
    const query = `
    {
      external {
        externalFoo(injectedFooArg: "wrapDefaultResolver")
        foo(fooArg: "overriddenField") {
          field
        }
      }
      external2
    }
    `
    const result = await graphql(newSchema, query)
    expect(result).toEqual({
      data: {
        external: {
          externalFoo: `wrapDefaultResolver(Query.external.ExternalType.externalFoo.defaultResolver)`,
          foo: {
            field: `overriddenField`,
          },
        },
        external2: `Query.external2`,
      },
    })
  })

  it(`rebuilds with new resolvers set via createResolvers`, async () => {
    mockCreateResolvers({
      ExternalType: {
        externalFoo: {
          resolve(value, args, context, info) {
            const original = info.originalResolver(value, args, context, info)
            return `newResolver(${original})`
          },
        },
      },
    })

    const newSchema = await rebuildTestSchema()
    const print = typePrinter(newSchema)

    expect(print(`ExternalType`)).toMatchInlineSnapshot(`
      "type ExternalType {
        externalFoo: String
      }"
    `)
    const query = `
    {
      external {
        externalFoo
      }
      external2
    }
    `
    const result = await graphql(newSchema, query)
    expect(result).toEqual({
      data: {
        external: {
          externalFoo: `newResolver(Query.external.ExternalType.externalFoo.defaultResolver)`,
        },
        external2: `Query.external2`,
      },
    })
  })
})

const mockCreateResolvers = resolvers => {
  const apiRunnerNode = require(`../../utils/api-runner-node`)
  apiRunnerNode.mockImplementation((api, { createResolvers }) => {
    if (api === `createResolvers`) {
      return createResolvers(resolvers)
    }
    return []
  })
}
