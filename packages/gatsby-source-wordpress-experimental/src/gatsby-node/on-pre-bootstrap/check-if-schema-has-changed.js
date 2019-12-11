const checkIfSchemaHasChanged = async ({ introspection, helpers }) => {
  const MD5_CACHE_KEY = `introspection-node-query-md5`

  const introspectionMD5 = helpers.createContentDigest(introspection)
  const cachedIntrospectionMD5 = await helpers.cache.get(MD5_CACHE_KEY)

  await helpers.cache.set(MD5_CACHE_KEY, introspectionMD5)

  const schemaHasChanged =
    introspectionMD5 &&
    cachedIntrospectionMD5 &&
    introspectionMD5 !== cachedIntrospectionMD5

  return schemaHasChanged
}

export default checkIfSchemaHasChanged
