global.jobs = {
  executedInThisProcess: [],
  createdInThisProcess: [],
  dotThenWasCalledWith: null,
  dotCatchWasCalledWith: null,
  awaitReturnedWith: null,
  awaitThrewWith: null
};

exports.createSchemaCustomization = async ({ actions }, pluginOptions) => {
  global.test = pluginOptions.fn()

  const { createTypes } = actions

  createTypes(`
    type NodeTypeTwo implements Node {
      thisIsANumber: Int
      string: String
      arrayOfStrings: [String]
    }

    type NodeTypeOne implements Node {
      overriddenString: Int
    }
  `)

  const sameJobInAllWorkersArgs = {
    description: `Same job created in all workers`
  }

  const commonJobDef = {
    name: `TEST_JOB_HANDLER`,
    inputPaths: [],
    outputDir: process.cwd()
  }

  global.jobs.createdInThisProcess.push(sameJobInAllWorkersArgs)
  actions.createJobV2({
    ...commonJobDef,
    args: sameJobInAllWorkersArgs,
  })

  const differentJobInAllWorkersArgs = {
    description: `Different job created in all workers (worker #${process.env.GATSBY_WORKER_ID})`
  }

  global.jobs.createdInThisProcess.push(differentJobInAllWorkersArgs)
  actions.createJobV2({
    ...commonJobDef,
    args: differentJobInAllWorkersArgs,
  })

  const thenedJobArgs = {
    description: `.then() job`
  }
  global.jobs.createdInThisProcess.push(thenedJobArgs)
  actions.createJobV2({
    ...commonJobDef,
    args: thenedJobArgs
  }).then(results => {
    global.jobs.dotThenWasCalledWith = results
  })

  const awaitedJobArgs = {
    description: `Awaited job`
  }
  global.jobs.createdInThisProcess.push(awaitedJobArgs)
  const results = await actions.createJobV2({
    ...commonJobDef,
    args: awaitedJobArgs
  })
  global.jobs.awaitReturnedWith = results

  const caughtJobArgs = {
    description: `.catch() job`,
    throw: true
  }
  global.jobs.createdInThisProcess.push(caughtJobArgs)
  actions.createJobV2({
    ...commonJobDef,
    args: caughtJobArgs
  }).catch(error => {
    global.jobs.dotCatchWasCalledWith = error.message
  })

  try {
    const tryCatchedAwaitedJobArgs = {
      description: `try/catched awaited job`,
      throw: true
    }
    global.jobs.createdInThisProcess.push(tryCatchedAwaitedJobArgs)
    await actions.createJobV2({
      ...commonJobDef,
      args: tryCatchedAwaitedJobArgs
    })
  } catch (error) {
    global.jobs.awaitThrewWith = error.message
  }
}

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    NodeTypeOne: {
      resolverField: {
        type: "String",
        resolve() {
          return `Custom String`
        }
      },
      fieldWithArg: {
        type: "String",
        args: {
          isCool: "Boolean"
        },
        resolve(source, args) {
          if (args.isCool) {
            return `You are cool`
          } else {
            return `You are not cool`
          }
        }
      }
    }
  }

  createResolvers(resolvers)
}

exports.setFieldsOnGraphQLNodeType = ({ type }) => {
  if (type.name === `NodeTypeOne`) {
    return {
      fieldsOnGraphQL: {
        type: `String`,
        resolve: () => {
          return `Another Custom String`
        }
      }
    }
  }

  return {}
}

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  const testData = {
    number: 123,
    string: 'Hello World',
    overriddenString: '1',
    arrayOfStrings: [`Foo`, `Bar`],
    object: {
      foo: 'bar',
      bar: 'baz'
    }
  }

  const nodeMeta = {
    id: createNodeId(`node-type-one-${testData.number}`),
    parent: null,
    children: [],
    internal: {
      type: `NodeTypeOne`,
      content: JSON.stringify(testData),
      contentDigest: createContentDigest(testData)
    }
  }

  const node = Object.assign({}, testData, nodeMeta)

  createNode(node)
}
