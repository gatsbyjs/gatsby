const { TypeComposer, InputTypeComposer } = require(`graphql-compose`)

const addResolvers = require(`../add-resolvers`)

const tc = TypeComposer.create(`type Foo { foo: Boolean }`)

addResolvers(tc)

describe(`Add resolvers (fieldConfigs)`, () => {
  it(`adds resolvers`, () => {
    expect(Array.from(tc.getResolvers().keys())).toEqual([
      `findOne`,
      `findMany`,
      `pagination`,
    ])

    expect(tc.getResolver(`findOne`).args.foo).toBeInstanceOf(InputTypeComposer)
    expect(tc.getResolver(`findOne`).resolve).toBeInstanceOf(Function)
    expect(tc.getResolver(`findOne`).type).toBeInstanceOf(TypeComposer)

    expect(tc.getResolver(`findMany`).args.filter).toBeInstanceOf(
      InputTypeComposer
    )
    expect(tc.getResolver(`findMany`).args.sort).toBeInstanceOf(
      InputTypeComposer
    )
    expect(tc.getResolver(`findMany`).args.skip).toBeDefined()
    expect(tc.getResolver(`findMany`).args.limit).toBeDefined()
    expect(tc.getResolver(`findMany`).resolve).toBeInstanceOf(Function)
    expect(tc.getResolver(`findMany`).type).toBeInstanceOf(Array)

    expect(tc.getResolver(`pagination`).args.filter).toBeInstanceOf(
      InputTypeComposer
    )
    expect(tc.getResolver(`pagination`).args.sort).toBeInstanceOf(
      InputTypeComposer
    )
    expect(tc.getResolver(`pagination`).args.skip).toBeDefined()
    expect(tc.getResolver(`pagination`).args.limit).toBeDefined()
    expect(tc.getResolver(`pagination`).resolve).toBeInstanceOf(Function)
    expect(tc.getResolver(`pagination`).type.getFields().items).toBeInstanceOf(
      Array
    )
    expect(tc.getResolver(`pagination`).type.getFields().count).toBeDefined()
    expect(
      tc.getResolver(`pagination`).type.getFields().pageInfo
    ).toBeInstanceOf(TypeComposer)
  })
})
