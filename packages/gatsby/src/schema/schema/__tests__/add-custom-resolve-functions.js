const { TypeComposer, schemaComposer } = require(`graphql-compose`)

const addCustomResolveFunctions = require(`../add-custom-resolve-functions`)

TypeComposer.create({
  name: `Foo`,
  fields: {
    foo: `Boolean`,
    bar: `type Bar { bar: Boolean }`,
  },
})

const apiRunner = require(`../../../utils/api-runner-node`)
jest.mock(`../../../utils/api-runner-node`)
apiRunner.mockImplementation((api, { addResolvers }) => {
  if (api === `addResolvers`) {
    const resolvers = {
      Foo: {
        foo: () => {},
        bar: () => {},
      },
      Bar: {
        bar: () => {},
      },
    }
    addResolvers(resolvers)
  }
})

addCustomResolveFunctions()

describe(`Add custom resolvers`, () => {
  it(`adds resolver function to field`, () => {
    expect(schemaComposer.get(`Foo`).getFields().foo.resolve).toBeInstanceOf(
      Function
    )
    expect(schemaComposer.get(`Foo`).getFields().bar.resolve).toBeInstanceOf(
      Function
    )
    expect(schemaComposer.get(`Bar`).getFields().bar.resolve).toBeInstanceOf(
      Function
    )
  })
})
