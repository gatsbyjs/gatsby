import fs from "fs-extra"
import { getStore } from "~/store"
import prettier from "prettier"
import { formatLogMessage } from "~/utils/format-log-message"

export const writeQueriesToDisk = async ({ reporter }, pluginOptions) => {
  if (!pluginOptions?.debug?.graphql?.writeQueriesToDisk) {
    return
  }

  const { remoteSchema } = getStore().getState()

  // the queries only change when the remote schema changes
  // no need to write them to disk in that case
  if (!remoteSchema.schemaWasChanged) {
    return
  }

  const activity = reporter.activityTimer(
    formatLogMessage(`writing GraphQL queries to disk at ./WordPress/GraphQL/`)
  )

  activity.start()
  const wordPressGraphQLDirectory = `${process.cwd()}/WordPress/GraphQL`

  // remove before writing in case there are old types
  fs.rmSync(wordPressGraphQLDirectory, {
    recursive: true,
    force: true,
  })

  for (const {
    nodeListQueries,
    nodeQuery,
    previewQuery,
    typeInfo,
  } of Object.values(remoteSchema.nodeQueries)) {
    const directory = `${wordPressGraphQLDirectory}/${typeInfo.nodesTypeName}`

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

  const directory = `${wordPressGraphQLDirectory}/RootQuery`

  await fs.ensureDir(directory)

  await fs.writeFile(
    `${directory}/non-node-root-query.graphql`,
    prettier.format(remoteSchema.nonNodeQuery, { parser: `graphql` })
  )

  activity.end()
}
