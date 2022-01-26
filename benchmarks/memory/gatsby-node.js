const { cpuCoreCount } = require(`gatsby-core-utils`)

const NUM_NODES = parseInt(process.env.NUM_NODES || 300, 10)

exports.sourceNodes = async ({ actions, reporter }) => {
  const contentDigest = Date.now().toString() // make each sourcing mark everything as dirty

  const activity = reporter.createProgress(`Creating test nodes`, NUM_NODES)
  activity.start()

  for (let i = 0; i < NUM_NODES; i++) {
    const largeSizeObj = {}
    for (let j = 1; j <= 1024; j++) {
      largeSizeObj[`key_${j}`] = `x`.repeat(1024)
    }

    // each node is ~2MB
    const node = {
      id: `memory-${i}`,
      idClone: `memory-${i}`,
      fooBar: [`foo`, `bar`, `baz`, `foobar`][i % 4],
      number1: 5,
      number2: 7,
      largeSizeObj,
      largeSizeString: `x`.repeat(1024 * 1024),
      internal: {
        contentDigest,
        type: `Test`,
      },
    }

    actions.createNode(node)

    if (i % 100 === 99) {
      activity.tick(100)
      await new Promise(resolve => setImmediate(resolve))
    }
  }

  activity.tick(NUM_NODES % 100)

  await new Promise(resolve => setTimeout(resolve, 100))

  activity.end()
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes(
    schema.buildObjectType({
      name: `Test`,
      fields: {
        idCloneWithResolver: {
          type: `String`,
          resolve: source => {
            return source.idClone
          },
        },
      },
      interfaces: ["Node"],
    })
  )
}

const printedMessages = new Set()
exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Query: {
      workerInfo: {
        type: `String`,
        args: {
          label: `String!`,
        },
        resolve: (_, args) => {
          const msg = `${args.label} on ${
            process.env.GATSBY_WORKER_ID
              ? `worker #${process.env.GATSBY_WORKER_ID}`
              : `main`
          }`
          if (!printedMessages.has(msg)) {
            printedMessages.add(msg)
            console.log(msg)
          }
          return msg
        },
      },
    },
  })
}

const WORKER_BATCH_SIZE =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

let enabledTemplates = new Set()
exports.onPreBootstrap = () => {
  const availableTemplates = new Set([
    `eq_id`, // this should skip node-model and fast filters completely and should be very cheap already
    `eq_field`, // this needs fast filters for eq operator on non-id field
    `eq_field_with_resolver`, // / this needs fast filters for eq operator on non-id field + materialization
  ])
  enabledTemplates = new Set(
    process.env.TEMPLATES
      ? process.env.TEMPLATES.split(`,`).filter(template =>
          availableTemplates.has(template)
        )
      : availableTemplates
  )

  console.info(`Enabled templates`, enabledTemplates)
}

exports.createPages = async ({ actions, graphql }) => {
  const numWorkers = Math.max(1, cpuCoreCount() - 1)

  // we do want ALL available workers to execute each query type
  const minNumOfPagesToSaturateAllWorkers = WORKER_BATCH_SIZE * numWorkers

  const { data } = await graphql(`
    {
      allTest {
        nodes {
          id
          idClone
        }
      }
    }
  `)

  // we might need to "duplicate" pages if node count is less than number of needed pages
  const repeatCount = Math.min(
    1,
    Math.ceil(minNumOfPagesToSaturateAllWorkers / data.allTest.nodes.length)
  )

  function createEnoughToSaturate(template, cb) {
    if (!enabledTemplates.has(template)) {
      return
    }
    console.log(`Creating pages with template "${template}"`)
    let counter = 0
    for (let i = 0; i < repeatCount; i++) {
      for (const node of data.allTest.nodes) {
        const { context } = cb(node)

        actions.createPage({
          path: `/${template}/${counter++}`,
          component: require.resolve(`./src/templates/${template}`),
          context,
        })

        if (counter >= minNumOfPagesToSaturateAllWorkers) {
          break
        }
      }
    }
  }

  // fast path (eq: { id: x })
  createEnoughToSaturate(`eq_id`, node => {
    return {
      context: {
        id: node.id,
      },
    }
  })

  // (eq: { idClone: x })
  createEnoughToSaturate(`eq_field`, node => {
    return {
      context: {
        id: node.id,
      },
    }
  })

  // (eq: { idCloneWithResolver: x })
  createEnoughToSaturate(`eq_field_with_resolver`, node => {
    return {
      context: {
        id: node.id,
      },
    }
  })
}
