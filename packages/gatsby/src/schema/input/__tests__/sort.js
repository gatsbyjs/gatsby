const { TypeComposer } = require(`graphql-compose`)
const {
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLList,
} = require(`graphql`)

const getSortInput = require(`../sort`)
const { addNodeInterface } = require(`../../interfaces`)

const tc = TypeComposer.create({
  name: `Foo`,
  fields: {
    bool: `Boolean`,
    array: [`Boolean`],
    nested: [`type Nested { bool: [Boolean!]! }`],
    enum: `enum CustomEnum { FOO BAR }`,
  },
})
addNodeInterface(tc)
const itc = tc.getITC()
const sort = getSortInput(itc)

describe(`Sort input`, () => {
  it(`builds sort input type`, () => {
    expect(sort.getType()).toBeInstanceOf(GraphQLInputObjectType)
    expect(sort.getFieldNames()).toEqual([`fields`, `order`])
  })

  it(`does not mutate input`, () => {
    expect(itc.getFieldType(`bool`)).toBe(GraphQLBoolean)
    expect(itc.getFieldType(`array`)).toBeInstanceOf(GraphQLList)
    expect(itc.getFieldType(`array`).ofType).toBe(GraphQLBoolean)
  })

  it(`adds sort order enum`, () => {
    expect(sort.getFieldType(`order`)).toBeInstanceOf(GraphQLEnumType)
    expect(sort.getField(`order`).defaultValue).toBe(`ASC`)
    expect(sort.getFieldType(`order`).getValues()).toEqual([
      expect.objectContaining({ name: `ASC`, value: `ASC` }),
      expect.objectContaining({ name: `DESC`, value: `DESC` }),
    ])
  })

  it(`adds sort fields`, () => {
    expect(sort.getFieldType(`fields`).ofType).toBeInstanceOf(GraphQLEnumType)
    expect(sort.getFieldType(`fields`).ofType.getValues()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: `BOOL`, value: `bool` }),
        expect.objectContaining({ name: `ARRAY`, value: `array` }),
        expect.objectContaining({ name: `ENUM`, value: `enum` }),
        expect.objectContaining({
          name: `NESTED___BOOL`,
          value: `nested.bool`,
        }),
      ])
    )
  })

  it(`adds Node interface fields`, () => {
    const sortKeys = sort.getFieldType(`fields`).ofType.getValues()
    expect(sortKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: `ID`, value: `id` }),
        expect.objectContaining({ name: `PARENT___ID`, value: `parent.id` }),
        expect.objectContaining({
          name: `PARENT___PARENT___ID`,
          value: `parent.parent.id`,
        }),
        expect.objectContaining({
          name: `PARENT___PARENT___PARENT___ID`,
          value: `parent.parent.parent.id`,
        }),
      ])
    )
  })

  it(`respects max sort depth`, () => {
    const sortKeys = sort.getFieldType(`fields`).ofType.getValues()
    expect(sortKeys).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: `PARENT___PARENT___PARENT___PARENT___ID`,
          value: `parent.parent.parent.parent.id`,
        }),
      ])
    )
  })

  it(`built sort input fields match snapshot`, () => {
    expect(
      sort
        .getFieldType(`fields`)
        .ofType.getValues()
        .map(({ name, value }) => ({ name, value }))
    ).toMatchSnapshot()
  })
})
