import fs from "fs-extra"
import store from "~/store"
import prettier from "prettier"
import { formatLogMessage } from "~/utils/format-log-message"

export const writeQueriesToDisk = async ({ reporter }, pluginOptions) => {
  if (!pluginOptions.debug.graphql.writeQueriesToDisk) {
    return
  }

  const { remoteSchema } = store.getState()

  console.log(`writing`)
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
      prettier.format(nodeListQueries[0], { parser: `graphql` }),
      `utf8`
    )

    await fs.writeFile(
      `${directory}/node-single-query.graphql`,
      prettier.format(nodeQuery, { parser: `graphql` }),
      `utf8`
    )

    await fs.writeFile(
      `${directory}/node-preview-query.graphql`,
      prettier.format(previewQuery, { parser: `graphql` }),
      `utf8`
    )
  }

  activity.end()
  dd(`and so it was written.`)
}
