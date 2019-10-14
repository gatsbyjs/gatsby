const express = require(`express`)

const sleep = timeout =>
  new Promise(resolve => {
    setTimeout(resolve, timeout)
  })

exports.createPages = async ({ reporter }) => {
  const successfulActivity = reporter.createProgress(
    `Successful activity`,
    100,
    0
  )
  successfulActivity.start()
  await sleep(500)
  successfulActivity.tick(50)
  await sleep(500)
  successfulActivity.done()

  reporter.info(`info`)
  reporter.success(`success`)
  reporter.warn(`warn`)
  reporter.log(`log`)
  reporter.error(`error`)

  if (process.env.FAILING_ACTIVITY) {
    const unsuccessfulActivity = reporter.createProgress(
      `Failing activity`,
      100,
      0
    )
    unsuccessfulActivity.start()
    await sleep(500)
    unsuccessfulActivity.tick(75)
    unsuccessfulActivity.panicOnBuild(`Your car is on fire`)
  }

  if (process.env.PANIC_ON_BUILD) {
    reporter.panic(`Your house is on fire`)
  }

  if (process.env.UNHANDLED_REJECTION) {
    throw new Error(`This is an unhandled rejection`)
  }

  if (process.env.PROCESS_EXIT) {
    process.exit(1)
  }
}

const getCreateTestNode = ({
  actions,
  createNodeId,
  createContentDigest,
}) => data => {
  actions.createNode({
    ...data,
    id: createNodeId(`test-id`),
    internal: {
      type: `Test`,
      contentDigest: createContentDigest(data),
    },
  })
}

exports.sourceNodes = ({
  actions,
  webhookBody,
  createNodeId,
  createContentDigest,
}) => {
  const createTestNode = getCreateTestNode({
    actions,
    createNodeId,
    createContentDigest,
  })

  if (webhookBody && webhookBody.data) {
    createTestNode(webhookBody.data)
  } else {
    createTestNode({
      field: `Lorem Ipsum`,
    })
  }

  console.log({ webhookBody })
}

exports.onCreateDevServer = ({
  app,
  actions,
  createNodeId,
  createContentDigest,
}) => {
  app.post(`/___statefulUpdate/`, express.json(), (req, res) => {
    const createTestNode = getCreateTestNode({
      actions,
      createNodeId,
      createContentDigest,
    })

    createTestNode(req.body.data)

    res.end()
  })
}
