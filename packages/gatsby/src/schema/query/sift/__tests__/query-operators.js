const {
  InputTypeComposer,
  EnumTypeComposer,
  GraphQLDate,
} = require(`graphql-compose`)
const {
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} = require(`graphql`)

const getQueryOperators = require(`../query-operators`)

describe(`Get query operators`, () => {
  it(`gets operator fields for built-in scalars (except JSON)`, () => {
    const itc = InputTypeComposer.create(`
      input Foo {
        bool: Boolean
        date: Date
        float: Float
        id: ID
        int: Int
        json: JSON
        string: String
      }
    `)

    const operatorFields = Object.entries(itc.getFields()).reduce(
      (acc, [name, config]) => {
        acc[name] = getQueryOperators(config.type)
        return acc
      },
      {}
    )

    expect(operatorFields.bool).toBeInstanceOf(InputTypeComposer)
    expect(operatorFields.bool.getTypeName()).toBe(`BooleanQueryOperatorInput`)
    expect(operatorFields.bool.getFieldNames()).toEqual([`eq`, `ne`])
    expect(operatorFields.bool.getFieldType(`eq`)).toBe(GraphQLBoolean)

    expect(operatorFields.date).toBeInstanceOf(InputTypeComposer)
    expect(operatorFields.date.getTypeName()).toBe(`DateQueryOperatorInput`)
    expect(operatorFields.date.getFieldNames()).toEqual([
      `eq`,
      `ne`,
      `gt`,
      `gte`,
      `lt`,
      `lte`,
      `in`,
      `nin`,
    ])
    expect(operatorFields.date.getFieldType(`ne`)).toBe(GraphQLDate)

    expect(operatorFields.float).toBeInstanceOf(InputTypeComposer)
    expect(operatorFields.float.getTypeName()).toBe(`FloatQueryOperatorInput`)
    expect(operatorFields.float.getFieldNames()).toEqual([
      `eq`,
      `ne`,
      `gt`,
      `gte`,
      `lt`,
      `lte`,
      `in`,
      `nin`,
    ])
    expect(operatorFields.float.getFieldType(`gt`)).toBe(GraphQLFloat)

    expect(operatorFields.id).toBeInstanceOf(InputTypeComposer)
    expect(operatorFields.id.getTypeName()).toBe(`IDQueryOperatorInput`)
    expect(operatorFields.id.getFieldNames()).toEqual([`eq`, `ne`, `in`, `nin`])
    expect(operatorFields.id.getFieldType(`in`).ofType).toBe(GraphQLID)

    expect(operatorFields.int).toBeInstanceOf(InputTypeComposer)
    expect(operatorFields.int.getTypeName()).toBe(`IntQueryOperatorInput`)
    expect(operatorFields.int.getFieldNames()).toEqual([
      `eq`,
      `ne`,
      `gt`,
      `gte`,
      `lt`,
      `lte`,
      `in`,
      `nin`,
    ])
    expect(operatorFields.int.getFieldType(`nin`).ofType).toBe(GraphQLInt)

    expect(operatorFields.json).toBeNull()

    expect(operatorFields.string.getTypeName()).toBe(`StringQueryOperatorInput`)
    expect(operatorFields.string.getFieldNames()).toEqual([
      `eq`,
      `ne`,
      `in`,
      `nin`,
      `regex`,
      `glob`,
    ])
    expect(operatorFields.string.getFieldType(`regex`)).toBe(GraphQLString)
  })

  it(`gets operator fields for enums`, () => {
    const etc = EnumTypeComposer.create({
      name: `BarEnum`,
      values: {
        foo: true,
        bar: false,
      },
    })
    const operatorFields = getQueryOperators(etc.getType())
    expect(operatorFields).toBeInstanceOf(InputTypeComposer)
    expect(operatorFields.getTypeName()).toBe(`BarEnumQueryOperatorInput`)
    expect(operatorFields.getFieldNames()).toEqual([`eq`, `ne`, `in`, `nin`])
    expect(operatorFields.getFieldType(`eq`)).toBeInstanceOf(GraphQLEnumType)
    expect(operatorFields.getFieldType(`eq`).name).toBe(`BarEnum`)
  })
})
