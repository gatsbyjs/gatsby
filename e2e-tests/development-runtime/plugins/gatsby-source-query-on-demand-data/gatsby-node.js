const initialData = {
  data: `initial`,
  sleep: 0,
}

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
  webhookBody,
}) => {
  const { createNode } = actions

  function doCreateNode(data) {
    const id = `query-on-demand-testing-node`

    const node = {
      ...data,
      id: createNodeId(id),
      selector: id,
      internal: {
        contentDigest: createContentDigest(data),
        type: `QueryOnDemandMock`,
      },
    }
    return createNode(node)
  }

  if (webhookBody && webhookBody.updateData) {
    console.log(
      `[query-on-demand-source] Received webhook data`,
      webhookBody.updateData
    )
    /* 
      expected shape of webhook body:
      {
        "updateData": {
          sleep: <time-query-will-take-to-resolve-in-milliseconds>,
          data "<some-text-to-that-will-be-rendered-to-assert-update-did-happen>"
        }
      }
    */

    let dataAfterSync = {
      ...initialData,
    }
    if (webhookBody.updateData) {
      dataAfterSync = {
        ...dataAfterSync,
        ...webhookBody.updateData,
      }
    }

    doCreateNode(dataAfterSync)
  } else {
    doCreateNode(initialData)
  }
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    QueryOnDemandMock: {
      doSomeWaiting: {
        type: `String`,
        resolve: source => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(source.data)
            }, source.sleep)
          })
        },
      },
    },
  })
}
