const {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLList,
  GraphQLInputObjectType,
  Kind,
} = require(`graphql`)

const {
  inferInputObjectStructureFromFields,
} = require(`../infer-graphql-input-fields-from-fields.js`)

function isIntInput(type) {
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLInt },
    ne: { name: `ne`, type: GraphQLInt },
  })
}

function isIdInput(type) {
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLID },
    ne: { name: `ne`, type: GraphQLID },
  })
}

function isStringInput(type) {
  expect(type instanceof GraphQLInputObjectType).toBeTruthy()
  expect(type.getFields()).toEqual({
    eq: { name: `eq`, type: GraphQLString },
    ne: { name: `ne`, type: GraphQLString },
    regex: { name: `regex`, type: GraphQLString },
    glob: { name: `glob`, type: GraphQLString },
  })
}

function typeField(type) {
  return {
    type,
  }
}

describe(`GraphQL Input args from fields, test-only`, () => {
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
      scal_int: typeField(GraphQLInt),
      scal_float: typeField(GraphQLFloat),
      scal_string: typeField(GraphQLString),
      scal_bool: typeField(GraphQLBoolean),
      scal_odd_unknown: typeField(OddType),
    }

    const { inferredFields } = inferInputObjectStructureFromFields({
      fields,
      typeName: `AType`,
    })

    const int = inferredFields.scal_int.type
    expect(int.name).toBe(`scalIntQueryInt`)
    isIntInput(int)

    const float = inferredFields.scal_float.type
    expect(float.name).toBe(`scalFloatQueryFloat`)
    expect(float instanceof GraphQLInputObjectType).toBeTruthy()
    expect(float.getFields()).toEqual({
      eq: { name: `eq`, type: GraphQLFloat },
      ne: { name: `ne`, type: GraphQLFloat },
    })

    const string = inferredFields.scal_string.type
    expect(string.name).toBe(`scalStringQueryString`)
    isStringInput(string)

    const bool = inferredFields.scal_bool.type
    expect(bool.name).toBe(`scalBoolQueryBoolean`)
    expect(bool instanceof GraphQLInputObjectType).toBeTruthy()
    expect(bool.getFields()).toEqual({
      eq: { name: `eq`, type: GraphQLBoolean },
      ne: { name: `ne`, type: GraphQLBoolean },
    })

    expect(inferredFields).not.toHaveProperty(`scal_odd_unknown`)
  })

  it(`recursively converts object types`, async () => {
    const fields = {
      obj: typeField(
        new GraphQLObjectType({
          name: `Obj`,
          fields: {
            foo: typeField(GraphQLInt),
            bar: typeField(
              new GraphQLObjectType({
                name: `Jbo`,
                fields: {
                  foo: typeField(GraphQLString),
                },
              })
            ),
          },
        })
      ),
    }

    const { inferredFields } = inferInputObjectStructureFromFields({
      fields,
      typeName: `AType`,
    })

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
          cells: typeField(new GraphQLList(Cell)),
        }
      },
    })

    const Cell = new GraphQLObjectType({
      name: `Cell`,
      fields: () => {
        return {
          value: typeField(GraphQLInt),
        }
      },
    })

    const fields = {
      rows: typeField(new GraphQLList(Row)),
    }

    expect(() => {
      inferInputObjectStructureFromFields({
        fields,
        typeName: `ListTypes`,
      })
    }).not.toThrow()
  })

  it(`protects against infinite recursion on circular definitions`, async () => {
    const TypeA = new GraphQLObjectType({
      name: `TypeA`,
      fields: () => {
        return {
          typeb: typeField(TypeB),
        }
      },
    })

    const TypeB = new GraphQLObjectType({
      name: `TypeB`,
      fields: () => {
        return {
          bar: typeField(GraphQLID),
          typea: typeField(TypeA),
        }
      },
    })

    const fields = {
      entryPointA: typeField(TypeA),
      entryPointB: typeField(TypeB),
    }

    let inferredFields

    expect(() => {
      inferredFields = inferInputObjectStructureFromFields({
        fields,
        typeName: `AType`,
      }).inferredFields
    }).not.toThrow()

    const entryPointA = inferredFields.entryPointA.type
    const entryPointAFields = entryPointA.getFields()
    const entryPointB = inferredFields.entryPointB.type
    const entryPointBFields = entryPointB.getFields()

    expect(entryPointA instanceof GraphQLInputObjectType).toBeTruthy()
    expect(entryPointB instanceof GraphQLInputObjectType).toBeTruthy()
    isIdInput(entryPointBFields.bar.type)

    // next level should also work, ie. typeA -> type B
    const childAB = entryPointAFields.typeb.type
    const childABFields = childAB.getFields()
    expect(childAB instanceof GraphQLInputObjectType).toBeTruthy()
    isIdInput(childABFields.bar.type)

    // circular level should not be here, ie. typeA -> typeB -> typeA
    expect(childABFields.typea).toBeUndefined()

    // in the other direction, from entryPointB -> typeA, the latter shouldn't exist,
    // due to having no further non-circular fields to filter
    expect(entryPointBFields.typea).toBeUndefined()
  })

  it(`recovers from unknown output types`, async () => {
    const fields = {
      obj: {
        type: new GraphQLObjectType({
          name: `Obj`,
          fields: {
            aa: typeField(OddType),
            foo: typeField(GraphQLInt),
            bar: typeField(
              new GraphQLObjectType({
                name: `Jbo`,
                fields: {
                  aa: typeField(OddType),
                  foo: typeField(GraphQLString),
                  ba: typeField(OddType),
                  bar: typeField(GraphQLInt),
                },
              })
            ),
          },
        }),
      },
      odd: typeField(OddType),
    }

    const { inferredFields } = inferInputObjectStructureFromFields({
      fields,
      typeName: `AType`,
    })

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
  })

  it(`includes the filters of list elements`, async () => {
    const fields = {
      list: typeField(new GraphQLList(GraphQLFloat)),
    }

    const { inferredFields } = inferInputObjectStructureFromFields({
      fields,
      typeName: `AType`,
    })

    const list = inferredFields.list.type

    expect(list instanceof GraphQLInputObjectType).toBeTruthy()
    expect(list.getFields()).toEqual({
      eq: { name: `eq`, type: GraphQLFloat },
      ne: { name: `ne`, type: GraphQLFloat },
      in: { name: `in`, type: new GraphQLList(GraphQLFloat) },
    })
  })

  it(`strips away NonNull`, async () => {
    const fields = {
      nonNull: typeField(new GraphQLNonNull(GraphQLInt)),
    }

    const { inferredFields } = inferInputObjectStructureFromFields({
      fields,
      typeName: `AType`,
    })

    isIntInput(inferredFields.nonNull.type)
  })

  it(`extracts the fields you can sort on`, async () => {
    const fields = {
      foo: typeField(GraphQLString),
      bar: typeField(GraphQLFloat),
      baz: typeField(
        new GraphQLObjectType({
          name: `Baz`,
          fields: {
            ka: typeField(GraphQLFloat),
            ma: typeField(
              new GraphQLList(
                new GraphQLObjectType({
                  name: `Hol`,
                  fields: {
                    go: typeField(GraphQLFloat),
                  },
                })
              )
            ),
          },
        })
      ),
    }

    const { sort } = inferInputObjectStructureFromFields({
      fields,
      typeName: `AType`,
    })

    expect(sort.sort()).toEqual([`bar`, `baz___ka`, `baz___ma`, `foo`])
  })
})
