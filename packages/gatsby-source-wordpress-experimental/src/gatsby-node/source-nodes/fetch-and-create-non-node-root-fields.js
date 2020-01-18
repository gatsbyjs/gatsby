import store from "../../store"
import fetchGraphql from "../../utils/fetch-graphql"
import { createContentDigest } from "gatsby-core-utils"
import formatLogMessage from "../../utils/format-log-message"

const fetchAndCreateNonNodeRootFields = async () => {
  const {
    introspection: { nonNodeQuery },
    gatsbyApi: { helpers, pluginOptions },
  } = store.getState()

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`fetch root fields`)
  )

  activity.start()

  const { data } = await fetchGraphql({
    query: nonNodeQuery,
    ignoreGraphQLErrors: true,
  })

  await helpers.actions.createNode({
    ...data,
    id: `${pluginOptions.url}--rootfields`,
    parent: null,
    internal: {
      type: `Wp`,
      contentDigest: createContentDigest(data),
    },
  })

  activity.end()
}

export default fetchAndCreateNonNodeRootFields
