const initialData = {
  "page-query": {
    file: `page-query/module-a`,
  },
  "static-query-in-page-template": {
    file: `static-query-in-page-template/module-a`,
  },
  "static-query-under-page-template": {
    file: `static-query-under-page-template/module-a`,
  },
}

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
  webhookBody,
}) => {
  const { createNode } = actions

  function doCreateNodes(data) {
    Object.entries(data).forEach(([id, nodePartial]) => {
      const node = {
        ...nodePartial,
        id: createNodeId(id),
        selector: id,
        internal: {
          contentDigest: createContentDigest(nodePartial),
          type: `ModuleMock`,
        },
      }
      return createNode(node)
    })
  }

  if (webhookBody && webhookBody.modulesUpdate) {
    console.log(`[modules] Received webhook data`, webhookBody.modulesUpdate)
    /* 
      expected shape of webhook body:

      {
        modulesUpdate: {
          upsert: [{ id: "<id>", file: "<module-file-name>" }],
        }
      }
    */

    const dataAfterSync = { ...initialData }
    if (webhookBody.modulesUpdate.upsert) {
      webhookBody.modulesUpdate.upsert.forEach(
        ({ id, ...upsertNodePartial }) => {
          const existingNodeData = initialData[id]
          dataAfterSync[id] = {
            ...(existingNodeData || {}),
            ...upsertNodePartial,
          }
        }
      )
    }

    doCreateNodes(dataAfterSync)
  } else {
    doCreateNodes(initialData)
  }
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    ModuleMock: {
      mod: {
        type: `String`,
        resolve: async (source, _args, context) => {
          const moduleId = context.pageModel.setModule({
            source: require.resolve(
              `./src/components/query-modules/${source.file}`
            ),
          })

          return moduleId
        },
      },
    },
    Query: {
      moduleByName: {
        type: `String`,
        args: {
          name: {
            type: `String`,
          },
        },
        resolve: async (_source, args, context) => {
          const moduleId = context.pageModel.setModule({
            source: require.resolve(
              `./src/components/query-modules/${args.name}`
            ),
          })

          return moduleId
        },
      },
    },
  })
}
