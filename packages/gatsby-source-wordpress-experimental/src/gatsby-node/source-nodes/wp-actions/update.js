import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"
import formatLogMessage from "~/utils/format-log-message"
import chalk from "chalk"
import { buildTypeName } from "~/gatsby-node/create-schema-customization/helpers"

const wpActionUPDATE = async ({
  helpers,
  wpAction,
  intervalRefetching,
  cachedNodeIds,
}) => {
  const { reporter } = helpers

  const state = store.getState()
  const {
    gatsbyApi: {
      pluginOptions: { verbose },
    },
    remoteSchema: { nodeQueries },
  } = state

  const nodeId = wpAction.referencedPostGlobalRelayID

  if (wpAction.referencedPostStatus !== `publish`) {
    // if the post status isn't publish anymore, we need to remove the node
    // by removing it from cached nodes so it's garbage collected by Gatsby
    return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
  }

  const { nodeQueryString: query, typeInfo } = Object.values(nodeQueries).find(
    q => q.typeInfo.singularName === wpAction.referencedPostSingularName
  )

  const { data } = await fetchGraphql({
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })

  const updatedNodeContent = {
    ...data[wpAction.referencedPostSingularName],
    nodeType: typeInfo.nodesTypeName,
    type: typeInfo.nodesTypeName,
  }

  const { actions, getNode } = helpers
  const node = await getNode(nodeId)

  // touch the node so we own it
  await actions.touchNode({ nodeId })

  // then we can delete it
  await actions.deleteNode({ node })

  // recreate the deleted node but with updated data
  const { createContentDigest } = helpers
  await actions.createNode({
    ...updatedNodeContent,
    id: nodeId,
    parent: null,
    internal: {
      contentDigest: createContentDigest(updatedNodeContent),
      type: buildTypeName(typeInfo.nodesTypeName),
    },
  })

  if (intervalRefetching) {
    reporter.log(``)
    reporter.info(
      formatLogMessage(
        `${chalk.bold(`updated ${wpAction.referencedPostSingularName}`)} #${
          wpAction.referencedPostID
        }`
      )
    )

    if (verbose) {
      Object.entries(node)
        .filter(([key]) => !key.includes(`modifiedGmt`) && key !== `modified`)
        .forEach(([key, value]) => {
          if (
            // if the value of this field changed, log it
            typeof updatedNodeContent[key] === `string` &&
            value !== updatedNodeContent[key]
          ) {
            reporter.log(``)
            reporter.info(chalk.bold(`${key} changed`))
            reporter.log(``)
            reporter.log(`${chalk.italic.bold(`    from`)}`)
            reporter.log(`      ${value}`)
            reporter.log(chalk.italic.bold(`    to`))
            reporter.log(`      ${updatedNodeContent[key]}`)
            reporter.log(``)
          }
        })

      reporter.log(``)
    }
  }

  // we can leave cachedNodeIds as-is since the ID of the edited
  // node will be the same
  return cachedNodeIds
}

export default wpActionUPDATE
