const { schemaComposer, TypeComposer } = require(`graphql-compose`)
const { GraphQLBoolean } = require(`graphql`)

const addFieldsFromNodeAPI = require(`../add-fields-from-node-api`)
const { addNodeInterface } = require(`../../interfaces`)

const FooTC = TypeComposer.create({
  name: `Foo`,
  fields: {
    foo: `Boolean`,
    qux: { type: `type Qux { foo: Boolean }` },
  },
})
addNodeInterface(FooTC)

const apiRunner = require(`../../../utils/api-runner-node`)
jest.mock(`../../../utils/api-runner-node`)
apiRunner.mockImplementation((api, { type }) => {
  if (api === `setFieldsOnGraphQLNodeType`) {
    if (type.name === `Foo`) {
      return Promise.resolve([
        {
          bar: {
            type: `type Bar { baz: Boolean }`,
            args: { foo: `Boolean` },
            resolve: () => {},
          },
          [`qux.bar`]: `Boolean`,
        },
      ])
    }
    return Promise.resolve([{}])
  }
  return null
})

describe(`Add fields from setFieldsOnGraphQLNodeType API`, () => {
  beforeAll(async () => {
    await addFieldsFromNodeAPI()
  })

  it(`adds fields`, () => {
    const FooTC = schemaComposer.getTC(`Foo`)
    expect(FooTC.getFieldNames()).toEqual(
      expect.arrayContaining([`foo`, `bar`, `qux`])
    )
    expect(FooTC.getFieldTC(`bar`).getTypeName()).toBe(`Bar`)
    expect(FooTC.getFieldConfig(`bar`).resolve).toBeInstanceOf(Function)
    expect(FooTC.getFieldConfig(`bar`).args.foo.type).toBe(GraphQLBoolean)
  })

  it(`adds nested fields`, () => {
    const QuxTC = schemaComposer.getTC(`Qux`)
    expect(QuxTC.getFieldNames()).toEqual([`foo`, `bar`])
    expect(QuxTC.getFieldType(`bar`)).toBe(GraphQLBoolean)
  })
})
