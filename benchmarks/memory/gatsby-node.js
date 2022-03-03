const { cpuCoreCount } = require(`gatsby-core-utils`)

const NUM_KEYS_IN_LARGE_SIZE_OBJ = parseInt(process.env.BUILD_LARGE_OBJECT_COUNT || 1024, 10)
const NUM_NODES = parseInt(process.env.BUILD_NUM_NODES || 300, 10)
const LARGE_FIELD_SIZE_RAW = process.env.BUILD_STRING_NODE_SIZE || '1m'

// convert raw size to number
const regexpSize = /([0-9]+)([kmg])?/;
const match = LARGE_FIELD_SIZE_RAW.match(regexpSize);
const suffixSizes = ['k', 'm', 'g'];
let bytesMultiplier = 1;
if (match.length > 2 && suffixSizes.indexOf(match[2]) >= 0) {
  bytesMultiplier = 2 ** ((suffixSizes.indexOf(match[2]) + 1) * 10)
}
const LARGE_FIELD_SIZE = parseInt(match[1], 10) * bytesMultiplier;


exports.sourceNodes = async ({ actions, reporter }) => {
  const contentDigest = Date.now().toString() // make each sourcing mark everything as dirty

  const activity = reporter.createProgress(`Creating test nodes`, NUM_NODES)
  activity.start()

  for (let i = 0; i < NUM_NODES; i++) {
    const largeSizeObj = {}
    for (let j = 1; j <= NUM_KEYS_IN_LARGE_SIZE_OBJ; j++) {
      largeSizeObj[`key_${j}`] = `x`.repeat(1024)
    }

    // each node is ~2MB
    const node = {
      id: `memory-${i}`,
      idClone: `memory-${i}`,
      fooBar: [`foo`, `bar`, `baz`, `foobar`][i % 4],
      number1: i,
      number2: NUM_NODES - i,
      number3: i % 20,
      largeSizeObj,
      largeSizeString: `x`.repeat(LARGE_FIELD_SIZE),
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
  actions.createTypes([
    schema.buildObjectType({
      name: `TestLargeSizeObj`,
      fields: Object.fromEntries(
        new Array(NUM_KEYS_IN_LARGE_SIZE_OBJ)
          .fill(`String`)
          .map((value, index) => [`key_${index + 1}`, value])
      ),
    }),
    schema.buildObjectType({
      name: `Test`,
      fields: {
        idClone: `String`,
        fooBar: `String`,
        number1: `Int`,
        number2: `Int`,
        number3: `Int`,
        largeSizeString: `String`,
        largeSizeObj: `TestLargeSizeObj`,
        idCloneWithResolver: {
          type: `String`,
          resolve: source => {
            return source.idClone
          },
        },
      },
      interfaces: ["Node"],
      extensions: {
        infer: false,
      },
    }),
  ])
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
    `ne_field_collection_sort_skip_limit`, // collection query to check code path applying sorting and skip/limit
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
      let j = 0
      for (const node of data.allTest.nodes) {
        const { context } = cb(node, j)

        actions.createPage({
          path: `/${template}/${counter++}`,
          component: require.resolve(`./src/templates/${template}`),
          context,
        })

        if (counter >= minNumOfPagesToSaturateAllWorkers) {
          break
        }

        j++
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

  // allTest(
  //   filter: { idClone: { ne: $id } }
  //   sort: { fields: [number3], order: [ASC] }
  //   limit: 10
  //   skip: $skip
  // )
  createEnoughToSaturate(
    `ne_field_collection_sort_skip_limit`,
    (node, index) => {
      return {
        context: {
          id: node.id,
          skip: Math.max(index, NUM_NODES - 10), // limit is set to 10, so just setting upper bound so queries for last nodes do have 10 items
        },
      }
    }
  )
}
