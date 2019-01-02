const { schemaComposer, TypeComposer } = require(`graphql-compose`)

const { store } = require(`../../redux`)

const addThirdPartySchemas = () => {
  const schemas = store.getState().thirdPartySchemas
  schemas.forEach(schema => {
    const QueryTC = TypeComposer.create(schema.getQueryType())
    schemaComposer.Query.addFields(QueryTC.getFields())
  })
}

module.exports = addThirdPartySchemas
