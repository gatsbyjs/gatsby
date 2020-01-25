import fetchGraphql from "../../../utils/fetch-graphql"
import store from "../../../store"
import gql from "../../../utils/gql"

const checkIfSchemaHasChanged = async () => {
  const MD5_CACHE_KEY = `introspection-node-query-md5`
  const { helpers } = store.getState().gatsbyApi

  const { data } = await fetchGraphql({
    query: gql`
      {
        schemaMd5
      }
    `,
  })

  const { schemaMd5 } = data

  const cachedSchemaMd5 = await helpers.cache.get(MD5_CACHE_KEY)

  await helpers.cache.set(MD5_CACHE_KEY, schemaMd5)

  const schemaWasChanged = schemaMd5 !== cachedSchemaMd5

  // record wether the schema changed so other logic can beware
  store.dispatch.remoteSchema.setSchemaWasChanged(schemaWasChanged)

  return schemaWasChanged
}

export default checkIfSchemaHasChanged
