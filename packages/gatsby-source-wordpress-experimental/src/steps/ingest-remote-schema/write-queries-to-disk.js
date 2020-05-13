import fs from "fs-extra"
import store from "~/store"
import graphqlPrettier from "graphql-prettier"
import { formatLogMessage } from "~/utils/format-log-message"

export const writeQueriesToDisk = async ({ reporter }, pluginOptions) => {
  if (!pluginOptions.debug.graphql.writeQueriesToDisk) {
    return
  }

  const { remoteSchema } = store.getState()

  const activity = reporter.activityTimer(
    formatLogMessage(`writing GraphQL queries to disk at ./WordPress/GraphQL/`)
  )

  activity.start()
  for (const {
    nodeListQueries,
    nodeQuery,
    previewQuery,
    typeInfo,
  } of Object.values(remoteSchema.nodeQueries)) {
    const directory = `${process.cwd()}/WordPress/GraphQL/${
      typeInfo.nodesTypeName
    }`

    await fs.ensureDir(directory)

    await fs.writeFile(
      `${directory}/node-list-query.graphql`,
      graphqlPrettier(nodeListQueries[0]),
      `utf8`
    )

    await fs.writeFile(
      `${directory}/node-single-query.graphql`,
      graphqlPrettier(nodeQuery),
      `utf8`
    )

    await fs.writeFile(
      `${directory}/node-preview-query.graphql`,
      graphqlPrettier(previewQuery),
      `utf8`
    )
  }

  activity.end()
}
