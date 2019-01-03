const { TypeComposer, schemaComposer } = require(`graphql-compose`)

const addCustomResolveFunctions = require(`../add-custom-resolve-functions`)

TypeComposer.create({
  name: `Foo`,
  fields: {
    bar: `Boolean`,
    baz: `type Baz { qux: Boolean }`,
  },
})

const resolver = jest.fn()

const apiRunner = require(`../../../utils/api-runner-node`)
jest.mock(`../../../utils/api-runner-node`)
apiRunner.mockImplementation((api, { addResolvers }) => {
  if (api === `addResolvers`) {
    const resolvers = {
      Foo: {
        bar: resolver,
        baz: () => {},
      },
      Baz: {
        qux: () => {},
      },
    }
    addResolvers(resolvers)
  }
})

addCustomResolveFunctions()

describe(`Add custom resolvers`, () => {
  it(`adds resolver function to field`, () => {
    expect(schemaComposer.get(`Foo`).getFields().bar.resolve).toBeInstanceOf(
      Function
    )
    expect(schemaComposer.get(`Foo`).getFields().baz.resolve).toBeInstanceOf(
      Function
    )
    expect(schemaComposer.get(`Baz`).getFields().qux.resolve).toBeInstanceOf(
      Function
    )
  })

  it(`adds schemaComposer to resolver context`, () => {
    schemaComposer
      .get(`Foo`)
      .getFields()
      .bar.resolve()
    expect(resolver).toBeCalledWith(
      expect.objectContaining({ context: { schemaComposer } })
    )
  })
})
