const { TypeComposer, GraphQLJSON } = require(`graphql-compose`)
const { GraphQLBoolean, GraphQLList, GraphQLObjectType } = require(`graphql`)

const { addInferredFields } = require(`../infer`)
// const { getExampleValue } = require(`../example-value`)

// TODO: Make sure we test all the fields we have in the example-value fixture

// TODO: Make this a fixture, and use in all the tests.
// FIXME: It's confusing to have this globally for this file, but only
// use it in the first test
const nodes = [
  {
    id: 1,
    parent: null,
    internal: { type: `File` },
    dir: `/home/me/foo`,
  },
  {
    id: 2,
    parent: 1,
    internal: { type: `Foo` },
    filePath: `./bar/baz.txt`,
    filePaths: [[`./bar/baz.txt`]],
  },
  {
    id: 3,
    parent: null,
    internal: { type: `File` },
    absolutePath: `/home/me/foo/bar/baz.txt`,
  },
]

const { getById, getNodesByType } = require(`../../db`)
jest.mock(`../../db`) // TODO: Maybe jest.mock(`../../db`, () => ({ getById: jest.fn().mockImplementation(/* ... */) }))
getById.mockImplementation(id => nodes.find(n => n.id === id))
getNodesByType.mockImplementation(type =>
  nodes.filter(n => n.internal.type === type)
)

describe(`Type inference`, () => {
  // beforeEach(() => {
  //   schemaComposer.clear()
  // })

  it(`infers correct fieldconfigs from example value and adds them to type`, () => {
    const exampleValue = {
      array: [1],
      bigInt: 1e10,
      bool: true,
      dateString: `2018-01-01`,
      dateStrings: [`2018-01-01`],
      dateObject: new Date(`2018-01-01`),
      dateObjects: [new Date(`2018-01-01`)],
      float: 0.1,
      int: 1,
      nestedArray: [[1]],
      nonExistingFilePath: `./foobar.txt`,
      string: `Foo bar`,
      stringObject: new String(`Foo bar`),
    }

    const typeName = `Bar`
    const tc = TypeComposer.createTemp(typeName)

    addInferredFields(tc, exampleValue, typeName)

    const fields = tc.getFields()
    const expected = {
      array: [`Int`],
      bigInt: `Float`,
      bool: `Boolean`,
      dateString: {
        type: `Date`,
        astNode: expect.objectContaining({ directives: expect.any(Array) }),
      },
      dateStrings: {
        type: [`Date`],
        astNode: expect.objectContaining({ directives: expect.any(Array) }),
      },
      dateObject: {
        type: `Date`,
        astNode: expect.objectContaining({ directives: expect.any(Array) }),
      },
      dateObjects: {
        type: [`Date`],
        astNode: expect.objectContaining({ directives: expect.any(Array) }),
      },
      float: `Float`,
      int: `Int`,
      nestedArray: [[`Int`]],
      nonExistingFilePath: `String`,
      string: `String`,
      stringObject: `String`,
    }
    expect(fields).toEqual(expected)
  })

  it(`creates new type for nested field`, () => {
    const exampleValue = {
      foo: [[{ bar: [{ qux: { foo: `Bar` } }] }]],
    }

    const typeName = `Baz`
    const tc = TypeComposer.createTemp({
      name: typeName,
      fields: {
        foo: [
          [
            TypeComposer.createTemp({
              name: `BazFoo`,
              fields: {
                bar: [
                  TypeComposer.createTemp({
                    name: `BazFooBar`,
                    fields: { baz: `Int` },
                  }),
                ],
              },
            }),
          ],
        ],
      },
    })

    addInferredFields(tc, exampleValue, typeName)

    const addedType = tc
      .getFieldTC(`foo`)
      .getFieldTC(`bar`)
      .getFieldTC(`qux`)
    expect(addedType.getTypeName()).toBe(`BazFooBarQux`)
  })

  it(`infers File type from filepath if filepath exists in db`, () => {
    const exampleValue = nodes[1] // FIXME:

    const typeName = `Foo`
    const tc = TypeComposer.createTemp(typeName)

    addInferredFields(tc, exampleValue, typeName)

    const filePathField = tc.getField(`filePath`)
    expect(filePathField.type).toBe(`File`)
    // expect(typeof filePathField.resolve).toBe(`function`)
    expect(filePathField.resolve).toBeInstanceOf(Function)

    const filePathsField = tc.getField(`filePaths`)
    expect(filePathsField.type).toEqual([[`File`]])
    // expect(typeof filePathsField.resolve).toBe(`function`)
    expect(filePathsField.resolve).toBeInstanceOf(Function)
  })

  it(`extends existing types`, () => {
    const exampleValue = {
      existing: {
        nested: { baz: true },
        nestedArray: [{ foo: `bar`, bar: true, baz: [[{ foo: true }]] }],
        deeplyNested: [[{ foo: { bar: 1, qux: { foo: true } } }]],
      },
    }

    // TODO: Maybe write this in SDL for better readability
    const typeName = `Qux`
    const tc = TypeComposer.createTemp({
      name: typeName,
      fields: {
        existing: TypeComposer.createTemp({
          name: `Existing`,
          fields: {
            foo: `Boolean`,
            nested: TypeComposer.createTemp({
              name: `Nested`,
              fields: { bar: `Int` },
            }),
            nestedArray: [
              TypeComposer.createTemp({
                name: `NestedArray`,
                fields: { qux: `Int` },
              }),
            ],
            deeplyNested: [
              [
                TypeComposer.createTemp({
                  name: `DeeplyNested`,
                  fields: {
                    foo: TypeComposer.create({
                      name: `DeeplyNestedFoo`,
                      fields: { baz: `Int` },
                    }),
                  },
                }),
              ],
            ],
          },
        }),
      },
    })

    addInferredFields(tc, exampleValue, typeName)

    const existingType = tc.getFieldTC(`existing`)
    const existingFields = existingType.getFieldNames()
    expect(existingFields).toEqual([
      `foo`,
      `nested`,
      `nestedArray`,
      `deeplyNested`,
    ])

    const nestedType = existingType.getFieldTC(`nested`)
    const nestedFields = nestedType.getFieldNames()
    expect(nestedFields).toEqual([`bar`, `baz`])

    const nestedArrayType = existingType.getFieldTC(`nestedArray`)
    const nestedArrayFields = nestedArrayType.getFieldNames()
    expect(nestedArrayFields).toEqual([`qux`, `foo`, `bar`, `baz`])

    const nestedArrayAddedType = nestedArrayType.getFieldTC(`baz`)
    const nestedArrayAddedFields = nestedArrayAddedType.getFieldNames()
    expect(nestedArrayAddedFields).toEqual([`foo`])

    const nestedArrayAddedFieldType = nestedArrayType.getFieldType(`baz`)
    expect(nestedArrayAddedFieldType).toBeInstanceOf(GraphQLList)
    expect(nestedArrayAddedFieldType.ofType).toBeInstanceOf(GraphQLList)
    expect(nestedArrayAddedFieldType.ofType.ofType).toBeInstanceOf(
      GraphQLObjectType
    )

    const deeplyNestedType = existingType.getFieldTC(`deeplyNested`)
    const deeplyNestedFields = deeplyNestedType.getFieldNames()
    expect(deeplyNestedFields).toEqual([`foo`])

    const deeplyNestedFooType = deeplyNestedType.getFieldTC(`foo`)
    const deeplyNestedFooFields = deeplyNestedFooType.getFieldNames()
    expect(deeplyNestedFooFields).toEqual([`baz`, `bar`, `qux`])

    const deeplyNestedFooAddedType = deeplyNestedFooType.getFieldType(`qux`)
    expect(deeplyNestedFooAddedType).toBe(GraphQLJSON)
  })

  it(`does not overwrite pre-existing fields`, () => {
    const exampleValue = {
      foo: 1,
      bar: [1],
      baz: [true],
      qux: [[true]],
      nested: 1,
      nestedObject: { foo: 1 },
    }

    const typeName = `Foo`
    const tc = TypeComposer.createTemp({
      name: typeName,
      fields: {
        foo: `Boolean`,
        bar: [`Boolean`],
        baz: `Boolean`,
        qux: [`Boolean`],
        nested: TypeComposer.createTemp({
          name: `Nested`,
          fields: {
            foo: `Boolean`,
          },
        }),
        nestedObject: `Boolean`,
      },
    })

    addInferredFields(tc, exampleValue, typeName)

    expect(tc.getFieldType(`foo`)).toBe(GraphQLBoolean)
    expect(tc.getFieldType(`bar`)).toBeInstanceOf(GraphQLList)
    expect(tc.getFieldType(`bar`).ofType).toBe(GraphQLBoolean)
    expect(tc.getFieldType(`baz`)).toBe(GraphQLBoolean)
    expect(tc.getFieldType(`qux`)).toBeInstanceOf(GraphQLList)
    expect(tc.getFieldType(`qux`).ofType).toBe(GraphQLBoolean)
    expect(tc.getFieldType(`nested`)).toBeInstanceOf(GraphQLObjectType)
    expect(tc.getFieldType(`nestedObject`)).toBe(GraphQLBoolean)
  })

  it(`honors MAX_DEPTH setting`, () => {
    const exampleValue = { foo: { bar: { baz: { qux: { foo: true } } } } }

    const typeName = `Foo`
    const tc = TypeComposer.create(typeName)

    addInferredFields(tc, exampleValue, typeName)

    const addedType = tc
      .getFieldTC(`foo`)
      .getFieldTC(`bar`)
      .getFieldTC(`baz`)
      .getFieldType(`qux`)
    expect(addedType).toBe(GraphQLJSON)
  })
})
