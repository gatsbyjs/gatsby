const { TypeComposer, schemaComposer } = require(`graphql-compose`)

const hasResolvers = require(`../has-resolvers`)

TypeComposer.create({
  name: `Foo`,
  fields: {
    foo: [
      TypeComposer.create({
        name: `Baz`,
        fields: {
          baz: `Boolean`,
          qux: {
            type: `Boolean`,
            resolve: () => {},
          },
        },
      }),
    ],
    bar: {
      type: [TypeComposer.create(`type Bar { bar: Boolean }`)],
      resolve: () => {},
    },
  },
})
schemaComposer.Query.addFields({ foo: `Foo` })
const schema = schemaComposer.buildSchema()
const type = schema.getType(`Foo`)

describe(`hasResolvers util`, () => {
  it(`finds resolvers if present`, () => {
    expect(hasResolvers(type, { foo: { qux: true } })).toBeTruthy()
    expect(hasResolvers(type, { bar: true })).toBeTruthy()
  })

  it(`finds no resolvers if none present`, () => {
    expect(hasResolvers(type, { foo: { baz: true } })).toBeFalsy()
  })
})
