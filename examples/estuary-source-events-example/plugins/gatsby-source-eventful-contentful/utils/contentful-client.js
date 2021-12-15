const { createClient: createContentfulClient } = require("contentful")

exports.createClient = function createClient({
  pluginOptions: { accessToken, space },
}) {
  const client = createContentfulClient({
    accessToken,
    space,
  })

  return client
}
