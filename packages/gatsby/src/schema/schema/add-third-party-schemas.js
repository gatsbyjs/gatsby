const { schemaComposer } = require(`graphql-compose`)

const { store } = require(`../../redux`)

const addThirdPartySchemas = () => {
  const schemas = store.getState().thirdPartySchemas
  schemas.forEach(schema => {
    const fields = schema.getQueryType().getFields()
    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
      // We need to recreate the field, because the result of `getFields`
      // is a runtime representation that cannot be used to build new schemas.
      const { type, args, resolve, description } = fieldConfig
      schemaComposer.Query.addFields({
        [fieldName]: { type, args, resolve, description },
      })
    })
  })
}

module.exports = addThirdPartySchemas
