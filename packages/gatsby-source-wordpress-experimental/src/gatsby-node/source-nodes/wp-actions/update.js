import fetchGraphql from "../../../utils/fetch-graphql"
import store from "../../../store"
import formatLogMessage from "../../../utils/format-log-message"
import { parse } from "url"
import chalk from "chalk"

const wpActionUPDATE = async ({
  helpers,
  wpAction,
  intervalRefetching,
  cachedNodeIds,
  pluginOptions,
}) => {
  const { reporter } = helpers

  const state = store.getState()
  const {
    gatsbyApi: {
      pluginOptions: { verbose },
    },
    introspection: { queries },
  } = state

  const nodeId = wpAction.referencedPostGlobalRelayID

  if (wpAction.referencedPostStatus !== `publish`) {
    // if the post status isn't publish anymore, we need to remove the node
    // by removing it from cached nodes so it's garbage collected by Gatsby
    return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
  }

  const { nodeQueryString: query, typeInfo } = Object.values(queries).find(
    q => q.typeInfo.singularName === wpAction.referencedPostSingularName
  )

  const { url } = pluginOptions
  const { data } = await fetchGraphql({
    url,
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })

  const updatedNodeContent = {
    ...data[wpAction.referencedPostSingularName],
    contentType: wpAction.referencedPostSingularName,
    path: parse(data[wpAction.referencedPostSingularName].link).pathname,
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
      type: `Wp${typeInfo.nodesTypeName}`,
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
