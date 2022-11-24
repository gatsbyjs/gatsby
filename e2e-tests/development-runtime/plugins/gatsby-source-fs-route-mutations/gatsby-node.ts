import { GatsbyNode } from "gatsby"

let createdNodes = new Set<string>()

export const sourceNodes: GatsbyNode["sourceNodes"] = ({
  actions,
  webhookBody,
  getNode,
  createContentDigest,
  reporter,
}) => {
  const handledNodes = new Set(createdNodes)
  function addNode(data: { id: string; slug: string; content: string }): void {
    const node = {
      ...data,
      parent: null,
      children: [],
      internal: {
        type: `FilesystemRoutesMutation`,
        contentDigest: createContentDigest(data),
      },
    }

    createdNodes.add(node.id)
    handledNodes.delete(node.id)

    actions.createNode(node)

    const childNode = {
      ...data,
      id: `${node.id} << childNode`,
      parent: node.id,
      internal: {
        type: `FilesystemRoutesMutationChild`,
        contentDigest: node.internal.contentDigest,
      },
    }
    actions.createNode(childNode)
    const parent = getNode(node.id)

    if (!parent) {
      throw new Error(`Could not find parent node`)
    }

    actions.createParentChildLink({
      parent: parent,
      child: childNode,
    })
  }

  if (webhookBody?.setup === `create`) {
    reporter.verbose(`[gatsby-source-fs-route-mutation] create a new node`)
    addNode({
      id: `fs-route-mutation-test`,
      slug: `new-node`,
      content: `This is node that was just created`,
    })
  } else if (webhookBody?.setup === `update`) {
    reporter.verbose(`[gatsby-source-fs-route-mutation] update a node`)
    addNode({
      id: `fs-route-mutation-test`,
      slug: `updated-node`,
      content: `This is node that had slug and content updated`,
    })
  } else if (webhookBody?.setup === `delete`) {
    reporter.verbose(`[gatsby-source-fs-route-mutation] delete a node`)
  } else {
    reporter.verbose(`[gatsby-source-fs-route-mutation] initial setup`)
  }

  addNode({
    id: `fs-route-mutation-stable`,
    slug: `stable`,
    content: `This is stable node`,
  })

  for (const nodeIdToDelete of handledNodes) {
    const nodeToDelete = getNode(nodeIdToDelete)
    if (nodeToDelete) {
      createdNodes.delete(nodeIdToDelete)
      actions.deleteNode(nodeToDelete)
    }
  }
}

export const createResolvers: GatsbyNode["createResolvers"] = ({
  createResolvers,
}) => {
  createResolvers({
    FilesystemRoutesMutation: {
      computed: {
        type: `String`,
        resolve(source: { slug?: string }): string {
          return `computed-${source.slug}`
        },
      },
    },
    FilesystemRoutesMutationChild: {
      computed: {
        type: `String`,
        resolve(source: { slug?: string }): string {
          return `computed-${source.slug}`
        },
      },
    },
  })
}
