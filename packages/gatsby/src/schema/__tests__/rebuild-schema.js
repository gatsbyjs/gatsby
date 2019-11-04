const { printSchema, printType } = require(`graphql`)
const { store } = require(`../../redux`)
const {
  build,
  rebuildWithSitePage,
  rebuildWithTypes,
  getDirtyTypes,
} = require(`..`)
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
      numberKey: 1,
      stringKey: `5`,
      dateKey: `2018-05-05`,
    },
    {
      id: `Nested1`,
      internal: { type: `Nested`, contentDigest: `0` },
      nested: {
        foo: { bar: { baz: `string` } },
      },
    },
  ]

  const nodeInterfaceFields = [`id`, `parent`, `children`, `internal`]
  const initialFooFields = [
    ...nodeInterfaceFields,
    `numberKey`,
    `stringKey`,
    `dateKey`,
  ]

  const addNode = node => store.dispatch({ type: `CREATE_NODE`, payload: node })
  const deleteNode = node =>
    store.dispatch({ type: `DELETE_NODE`, payload: node })

  const addNodeField = ({ node, name, value }) => {
    node.fields = node.fields || {}
    node.fields[name] = value
    store.dispatch({
      type: `ADD_FIELD_TO_NODE`,
      payload: node,
      addedField: name,
    })
  }

  let schema
  let initialPrintedSchema
  let initialTypes
  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    createNodes().forEach(addNode)

    await build({})
    schema = store.getState().schema
    initialTypes = Object.keys(schema.getTypeMap()).sort()
    initialPrintedSchema = printSchema(schema)
  })

  const rebuildTestSchema = async () => {
    await rebuildWithTypes({ typeNames: getDirtyTypes() })
    return store.getState().schema
  }

  const typePrinter = schema => typeName => printType(schema.getType(typeName))

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

  const expectSymmetricDelete = async node => {
    const newSchema = await deleteNodeAndRebuild(node)
    expect(printSchema(newSchema)).toEqual(initialPrintedSchema)
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

  it(`should report error when conflicting changes`, async () => {
    // TODO
  })
})
