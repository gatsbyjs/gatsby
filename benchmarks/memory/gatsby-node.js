const { cpuCoreCount } = require(`gatsby-core-utils`)

const NUM_NODES = parseInt(process.env.NUM_NODES || 300, 10)

exports.sourceNodes = async ({ actions }) => {
  for (let i = 0; i < NUM_NODES; i++) {
    const largeSizeObj = {}
    for (let j = 1; j <= 1024; j++) {
      largeSizeObj[`key_${j}`] = `x`.repeat(1024)
    }

    const node = {
      id: `memory-${i}`,
      idClone: `memory-${i}`,
      fooBar: [`foo`, `bar`, `baz`, `foobar`][i % 4],
      number1: 5,
      number2: 7,
      largeSizeObj,
      // largeSizeString: `x`.repeat(1024 * 1024),
      internal: {
        contentDigest: `hash`, // we won't be changing nodes so this can be hardcoded
        type: `Test`,
      },
    }

    actions.createNode(node)

    if (i % 100 === 99) {
      await new Promise(resolve => setImmediate(resolve))
    }
  }

  await new Promise(resolve => setTimeout(resolve, 100))
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

const WORKER_BATCH_SIZE = 50
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

  function createEnoughToSaturate(cb) {
    let counter = 0
    for (let i = 0; i < repeatCount; i++) {
      for (const node of data.allTest.nodes) {
        const { template, context } = cb(node)

        actions.createPage({
          path: `/${template}/${counter++}`,
          component: require.resolve(`./src/templates/${template}`),
          context,
        })
      }
    }
  }

  // fast path (eq: { id: x })
  createEnoughToSaturate(node => {
    return {
      template: `eq_id`,
      context: {
        id: node.id,
      },
    }
  })

  // (eq: { idClone: x })
  createEnoughToSaturate(node => {
    return {
      template: `eq_field`,
      context: {
        id: node.id,
      },
    }
  })
}
