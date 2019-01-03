const {
  schemaComposer,
  TypeComposer,
  SchemaComposer,
} = require(`graphql-compose`)

const addThirdPartySchemas = require(`../add-third-party-schemas`)
const { dispatch } = require(`../../../redux`).store
const { addThirdPartySchema } = require(`../../../redux/actions`).actions

const thirdPartySchemaComposer = new SchemaComposer()
thirdPartySchemaComposer.Query.addFields({
  allThirdParty: {
    type: [`type ThirdParty { foo: Boolean }`],
    resolve: () => {},
  },
})
const thirdPartySchema = thirdPartySchemaComposer.buildSchema()
dispatch(addThirdPartySchema({ schema: thirdPartySchema }))

TypeComposer.create(`type Foo { foo: Boolean }`)
schemaComposer.Query.addFields({
  allFoo: {
    type: [`Foo`],
    resolve: () => {},
  },
})

addThirdPartySchemas()
const schema = schemaComposer.buildSchema()

describe(`Add third-party schemas`, () => {
  it(`adds fields to Query type`, () => {
    const queryFields = schema.getQueryType().getFields()
    expect(Object.keys(queryFields)).toEqual([`allFoo`, `allThirdParty`])
    expect(queryFields.allThirdParty.type.ofType.name).toBe(`ThirdParty`)
    expect(queryFields.allThirdParty.resolve).toBeInstanceOf(Function)
  })
})
