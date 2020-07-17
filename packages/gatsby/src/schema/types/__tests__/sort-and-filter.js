// NOTE: Previously `infer-graphql-input-from-fields-test.js`

const { createSchemaComposer } = require(`../../schema-composer`)
const { getFilterInput } = require(`../filter`)
const { getSortInput } = require(`../sort`)

const {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLList,
  GraphQLInputObjectType,
  Kind,
} = require(`graphql`)
import { GraphQLDate } from "../date"
const { GraphQLJSON } = require(`graphql-compose`)

const getInferredFields = fields => {
  const schemaComposer = createSchemaComposer()
  const tc = schemaComposer.createObjectTC({ name: `Test`, fields })
  return getFilterInput({ schemaComposer, typeComposer: tc })
    .getType()
    .getFields()
}

function isIntInput(type) {
  expect(type.name).toBe(`IntQueryOperatorInput`)
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLInt },
    ne: { name: `ne`, type: GraphQLInt },
    lt: { name: `lt`, type: GraphQLInt },
    lte: { name: `lte`, type: GraphQLInt },
    gt: { name: `gt`, type: GraphQLInt },
    gte: { name: `gte`, type: GraphQLInt },
    in: { name: `in`, type: new GraphQLList(GraphQLInt) },
    nin: { name: `nin`, type: new GraphQLList(GraphQLInt) },
  })
}

function isDateInput(type) {
  expect(type.name).toBe(`DateQueryOperatorInput`)
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLDate },
    ne: { name: `ne`, type: GraphQLDate },
    lt: { name: `lt`, type: GraphQLDate },
    lte: { name: `lte`, type: GraphQLDate },
    gt: { name: `gt`, type: GraphQLDate },
    gte: { name: `gte`, type: GraphQLDate },
    in: { name: `in`, type: new GraphQLList(GraphQLDate) },
    nin: { name: `nin`, type: new GraphQLList(GraphQLDate) },
  })
}

function isIdInput(type) {
  expect(type.name).toBe(`IDQueryOperatorInput`)
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLID },
    ne: { name: `ne`, type: GraphQLID },
    in: { name: `in`, type: new GraphQLList(GraphQLID) },
    nin: { name: `nin`, type: new GraphQLList(GraphQLID) },
  })
}

function isStringInput(type) {
  expect(type.name).toBe(`StringQueryOperatorInput`)
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLString },
    ne: { name: `ne`, type: GraphQLString },
    regex: { name: `regex`, type: GraphQLString },
    glob: { name: `glob`, type: GraphQLString },
    in: { name: `in`, type: new GraphQLList(GraphQLString) },
    nin: { name: `nin`, type: new GraphQLList(GraphQLString) },
  })
}

function isJsonInput(type) {
  expect(type.name).toBe(`JSONQueryOperatorInput`)
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLJSON },
    ne: { name: `ne`, type: GraphQLJSON },
    regex: { name: `regex`, type: GraphQLJSON },
    glob: { name: `glob`, type: GraphQLJSON },
    in: { name: `in`, type: new GraphQLList(GraphQLJSON) },
    nin: { name: `nin`, type: new GraphQLList(GraphQLJSON) },
  })
}

function isFloatInput(type) {
  expect(type.name).toBe(`FloatQueryOperatorInput`)
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLFloat },
    ne: { name: `ne`, type: GraphQLFloat },
    lt: { name: `lt`, type: GraphQLFloat },
    lte: { name: `lte`, type: GraphQLFloat },
    gt: { name: `gt`, type: GraphQLFloat },
    gte: { name: `gte`, type: GraphQLFloat },
    in: { name: `in`, type: new GraphQLList(GraphQLFloat) },
    nin: { name: `nin`, type: new GraphQLList(GraphQLFloat) },
  })
}

function isBoolInput(type) {
  expect(type.name).toBe(`BooleanQueryOperatorInput`)
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLBoolean },
    ne: { name: `ne`, type: GraphQLBoolean },
    in: { name: `in`, type: new GraphQLList(GraphQLBoolean) },
    nin: { name: `nin`, type: new GraphQLList(GraphQLBoolean) },
  })
}

function isCustomScalarInput(queryType, type) {
  expect(queryType instanceof GraphQLInputObjectType).toBeTruthy()
  expect(queryType.getFields()).toEqual({
    eq: { name: `eq`, type },
    ne: { name: `ne`, type },
    in: { name: `in`, type: new GraphQLList(type) },
    nin: { name: `nin`, type: new GraphQLList(type) },
  })
}

function isEnumInput(queryType, type) {
  expect(queryType instanceof GraphQLInputObjectType).toBeTruthy()
  expect(queryType.getFields()).toEqual({
    eq: { name: `eq`, type },
    ne: { name: `ne`, type },
    in: { name: `in`, type: new GraphQLList(type) },
    nin: { name: `nin`, type: new GraphQLList(type) },
  })
}

describe(`GraphQL Input args from fields`, () => {
  function oddValue(value) {
    return value % 2 === 1 ? value : null
  }

  const OddType = new GraphQLScalarType({
    name: `Odd`,
    serialize: oddValue,
    parseValue: oddValue,
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return oddValue(parseInt(ast.value, 10))
      }
      return null
    },
  })

  it(`handles all known scalars`, async () => {
    const fields = {
      scal_id: `ID`,
      scal_int: `Int`,
      scal_float: `Float`,
      scal_string: `String`,
      scal_bool: `Boolean`,
      scal_json: `JSON`,
      scal_date: `Date`,
      scal_odd: { type: OddType },
      scal_enum: {
        type: new GraphQLEnumType({
          name: `CustomEnum`,
          values: { FOO: { value: `foo` } },
        }),
      },
    }

    const inferredFields = getInferredFields(fields)

    const id = inferredFields.scal_id.type
    isIdInput(id)

    const int = inferredFields.scal_int.type
    isIntInput(int)

    const float = inferredFields.scal_float.type
    isFloatInput(float)

    const string = inferredFields.scal_string.type
    isStringInput(string)

    const bool = inferredFields.scal_bool.type
    isBoolInput(bool)

    const date = inferredFields.scal_date.type
    isDateInput(date)

    const json = inferredFields.scal_json.type
    isJsonInput(json)

    const custom_scalar = inferredFields.scal_odd.type
    isCustomScalarInput(custom_scalar, fields.scal_odd.type)

    const custom_enum = inferredFields.scal_enum.type
    isEnumInput(custom_enum, fields.scal_enum.type)
  })

  it(`recursively converts object types`, async () => {
    const fields = {
      obj: {
        type: new GraphQLObjectType({
          name: `Obj`,
          fields: {
            foo: { type: GraphQLInt },
            bar: {
              type: new GraphQLObjectType({
                name: `Jbo`,
                fields: {
                  foo: { type: GraphQLString },
                },
              }),
            },
          },
        }),
      },
    }

    const inferredFields = getInferredFields(fields)

    const obj = inferredFields.obj.type
    const objFields = obj.getFields()

    expect(obj instanceof GraphQLInputObjectType).toBeTruthy()
    isIntInput(objFields.foo.type)

    const innerObj = objFields.bar.type
    const innerObjFields = innerObj.getFields()
    isStringInput(innerObjFields.foo.type)
  })

  it(`handles lists within lists`, async () => {
    const Row = new GraphQLObjectType({
      name: `Row`,
      fields: () => {
        return {
          cells: { type: new GraphQLList(Cell) },
        }
      },
    })

    const Cell = new GraphQLObjectType({
      name: `Cell`,
      fields: () => {
        return {
          value: { type: GraphQLInt },
        }
      },
    })

    const fields = {
      rows: { type: new GraphQLList(Row) },
    }

    expect(() => {
      getInferredFields(fields)
    }).not.toThrow()
  })

  it(`protects against infinite recursion on circular definitions`, async () => {
    const TypeA = new GraphQLObjectType({
      name: `TypeA`,
      fields: () => {
        return {
          typeb: { type: TypeB },
        }
      },
    })

    const TypeB = new GraphQLObjectType({
      name: `TypeB`,
      fields: () => {
        return {
          bar: { type: GraphQLID },
          typea: { type: TypeA },
        }
      },
    })

    const fields = {
      entryPointA: { type: TypeA },
      entryPointB: { type: TypeB },
    }

    let inferredFields

    expect(() => {
      inferredFields = getInferredFields(fields)
    }).not.toThrow()

    const entryPointA = inferredFields.entryPointA.type
    const entryPointAFields = entryPointA.getFields()
    const entryPointB = inferredFields.entryPointB.type
    const entryPointBFields = entryPointB.getFields()

    expect(entryPointA instanceof GraphQLInputObjectType).toBeTruthy()
    expect(entryPointB instanceof GraphQLInputObjectType).toBeTruthy()
    isIdInput(entryPointBFields.bar.type)

    const childAB = entryPointAFields.typeb.type
    const childABFields = childAB.getFields()
    expect(childAB instanceof GraphQLInputObjectType).toBeTruthy()
    isIdInput(childABFields.bar.type)

    expect(childABFields.typea.type.name).toBe(`TypeAFilterInput`)

    expect(entryPointBFields.typea.type.name).toBe(`TypeAFilterInput`)
  })

  // NOTE: We now convert all scalars and enums
  it.skip(`recovers from unknown output types`, async () => {
    const fields = {
      obj: {
        type: new GraphQLObjectType({
          name: `Obj`,
          fields: {
            aa: { type: OddType },
            foo: { type: GraphQLInt },
            bar: {
              type: new GraphQLObjectType({
                name: `Jbo`,
                fields: {
                  aa: { type: OddType },
                  foo: { type: GraphQLString },
                  ba: { type: OddType },
                  bar: { type: GraphQLInt },
                },
              }),
            },
            baz: {
              type: new GraphQLObjectType({
                name: `Jbo2`,
                fields: {
                  aa: { type: OddType },
                },
              }),
            },
          },
        }),
      },
      odd: { type: OddType },
    }

    const inferredFields = getInferredFields(fields)

    expect(inferredFields.odd).toBeUndefined()

    const obj = inferredFields.obj.type
    const objFields = obj.getFields()

    expect(obj instanceof GraphQLInputObjectType).toBeTruthy()
    isIntInput(objFields.foo.type)
    expect(objFields.aa).toBeUndefined()

    const innerObj = objFields.bar.type
    const innerObjFields = innerObj.getFields()
    expect(innerObjFields.aa).toBeUndefined()
    isStringInput(innerObjFields.foo.type)
    expect(innerObjFields.ba).toBeUndefined()
    isIntInput(innerObjFields.bar.type)

    // innerObj.baz is object containing only unsupported types
    // so it should not be defined
    expect(innerObj.baz).toBeUndefined()
  })

  it(`includes the filters of list elements`, async () => {
    const fields = {
      list: { type: new GraphQLList(GraphQLFloat) },
    }

    const inferredFields = getInferredFields(fields)

    const list = inferredFields.list.type

    expect(list instanceof GraphQLInputObjectType).toBeTruthy()
    expect(list.getFields()).toEqual({
      eq: { name: `eq`, type: GraphQLFloat },
      ne: { name: `ne`, type: GraphQLFloat },
      gt: { name: `gt`, type: GraphQLFloat },
      gte: { name: `gte`, type: GraphQLFloat },
      lt: { name: `lt`, type: GraphQLFloat },
      lte: { name: `lte`, type: GraphQLFloat },
      in: { name: `in`, type: new GraphQLList(GraphQLFloat) },
      nin: { name: `nin`, type: new GraphQLList(GraphQLFloat) },
    })
  })

  it(`strips away NonNull`, async () => {
    const fields = {
      nonNull: { type: new GraphQLNonNull(GraphQLInt) },
    }

    const inferredFields = getInferredFields(fields)

    isIntInput(inferredFields.nonNull.type)
  })

  it(`extracts the fields you can sort on`, async () => {
    const fields = {
      foo: { type: GraphQLString },
      bar: { type: GraphQLFloat },
      baz: {
        type: new GraphQLObjectType({
          name: `Baz`,
          fields: {
            ka: { type: GraphQLFloat },
            ma: {
              type: new GraphQLList(
                new GraphQLObjectType({
                  name: `Hol`,
                  fields: {
                    go: { type: GraphQLFloat },
                  },
                })
              ),
            },
          },
        }),
      },
    }

    const schemaComposer = createSchemaComposer()
    const tc = schemaComposer.createObjectTC({ name: `Test`, fields })
    const sort = getSortInput({
      schemaComposer,
      typeComposer: tc,
    })
      .getType()
      .getFields()
      .fields.type.ofType.getValues()
      .map(({ name }) => name)

    expect(sort.sort()).toEqual([
      `bar`,
      `baz___ka`,
      `baz___ma`,
      `baz___ma___go`,
      `foo`,
    ])
  })
})
