const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInt,
  execute,
  subscribe,
} = require(`graphql`)
const { PubSub } = require(`graphql-subscriptions`)
const { SubscriptionServer } = require(`subscriptions-transport-ws`)
const { createServer } = require(`http`)
const fs = require(`fs`)
const path = require(`path`)
const { promisify } = require(`util`)
const Queue = require(`better-queue`)

const fileResource = require(`./providers/fs/file`)
const gatsbyPluginResource = require(`./providers/gatsby/plugin`)
const gatsbyShadowFileResource = require(`./providers/gatsby/shadow-file`)
const npmPackageResource = require(`./providers/npm/package`)
const npmPackageScriptResource = require(`./providers/npm/script`)

const SITE_ROOT = process.cwd()

const read = promisify(fs.readFile)

const pubsub = new PubSub()
const PORT = 4000

const context = { root: SITE_ROOT }

const configResource = {
  create: () => {},
  read: () => {},
  update: () => {},
  destroy: () => {},
  plan: () => {},
}

const componentResourceMapping = {
  File: fileResource,
  GatsbyPlugin: gatsbyPluginResource,
  ShadowFile: gatsbyShadowFileResource,
  Config: configResource,
  NPMPackage: npmPackageResource,
  NPMScript: npmPackageScriptResource,
}

let queue = new Queue(async (action, cb) => {
  await applyStep(action)
  cb()
})

queue.pause()
queue.on(`task_finish`, async () => {
  if (queue.length > 1) {
    queue.pause()
  }

  const nextId = queue._store._queue[0]
  const task = queue._store._tasks[nextId]
  const { plan, ...cmds } = task

  let planForNextStep = []
  const commandPlans = Object.entries(cmds).map(async ([key, val]) => {
    const resource = componentResourceMapping[key]
    if (!resource || !resource.plan) {
      return
    }

    if (resource && resource.config && resource.config.batch) {
      const cmdPlan = await resource.plan(context, val)
      planForNextStep.push({ resourceName: key, cmdPlan })
    } else {
      await asyncForEach(cmds[key], async cmd => {
        try {
          const commandPlan = await resource.plan(context, cmd)
          planForNextStep.push({ resourceName: key, ...commandPlan })
        } catch (e) {
          console.log(e)
        }
      })
    }
  })

  await Promise.all(commandPlans)

  emitOperation(`progress`, plan, planForNextStep)
})

const readPackage = async () => {
  const contents = await read(path.join(SITE_ROOT, `package.json`), `utf8`)
  return JSON.parse(contents)
}

const emitOperation = (state = `progress`, data, plan = []) => {
  pubsub.publish(`operation`, {
    state,
    data: JSON.stringify(data),
    planForNextStep: JSON.stringify(plan),
  })
}

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const applyStep = async ({ plan, ...step }) => {
  const commandsForStep = Object.keys(step).map(async key => {
    const resource = componentResourceMapping[key]
    if (resource && resource.config && resource.config.batch) {
      console.log(`resource.create`, { context, step: step[key] })
      await resource.create(context, step[key])

      step[key].map((_, i) => {
        step[key][i].state = `complete`
      })
      emitOperation(`progress`, plan)
      return
    }

    // Run serially for now until we optimize the steps in an operation
    await asyncForEach(step[key], async (cmd, i) => {
      try {
        await resource.create(context, cmd)
        step[key][i].state = `complete`
        emitOperation(`progress`, plan)
      } catch (e) {
        step[key][i].state = `error`
        step[key][i].errorMessage = e.toString()
        emitOperation(`progress`, plan)
      }
    })
  })

  await Promise.all(commandsForStep)
}

const applyPlan = plan => {
  plan.forEach(step => queue.push({ plan, ...step }))

  queue.on(`drain`, () => {
    emitOperation(`success`, plan)
  })
}

const OperationStateEnumType = new GraphQLEnumType({
  name: `OperationStateEnum`,
  values: {
    RUNNING: { value: `progress` },
    SUCCESS: { value: `success` },
    ERROR: { value: `error` },
  },
})

const OperationType = new GraphQLObjectType({
  name: `Operation`,
  fields: {
    state: { type: OperationStateEnumType },
    step: { type: GraphQLInt },
    data: { type: GraphQLString },
    planForNextStep: { type: GraphQLString },
  },
})

const NPMPackageScriptType = new GraphQLObjectType({
  name: `NPMPackageScript`,
  fields: {
    name: { type: GraphQLString },
    script: { type: GraphQLString },
  },
})

const NPMPackageType = new GraphQLObjectType({
  name: `NPMPackage`,
  fields: {
    name: { type: GraphQLString },
    version: { type: GraphQLString },
    path: { type: GraphQLString },
    scripts: { type: new GraphQLList(NPMPackageScriptType) },
  },
})

const GatsbyConfigPluginType = new GraphQLObjectType({
  name: `GatsbyConfigPlugin`,
  fields: {
    name: { type: GraphQLString },
    version: { type: GraphQLString },
  },
})

const rootQueryType = new GraphQLObjectType({
  name: `Root`,
  fields: () => {
    return {
      npmPackage: {
        type: NPMPackageType,
        args: {
          name: {
            type: GraphQLString,
          },
        },
        resolve: async (_, args) => {
          // TODO: peer/dev
          const { dependencies } = await readPackage()
          const version = dependencies[args.name]
          return { name: args.name, version }
        },
      },
      allNpmPackage: {
        type: new GraphQLList(NPMPackageType),
        resolve: async () => {
          const { dependencies } = await readPackage()

          return Object.entries(dependencies).map(([name, version]) => {
            return {
              name,
              version,
            }
          })
        },
      },
      allNpmPackageScripts: {
        type: new GraphQLList(NPMPackageScriptType),
        resolve: async () => {
          const { scripts } = await readPackage()
          return Object.entries(scripts).map(([name, script]) => {
            return {
              name,
              script,
            }
          })
        },
      },
      allGatsbyConfigPlugin: {
        type: new GraphQLList(GatsbyConfigPluginType),
        resolve: async () => {
          const plugins = gatsbyPluginResource.read({ root })
          return plugins.map(async name => {
            return { name }
          })
        },
      },
    }
  },
})

const rootMutationType = new GraphQLObjectType({
  name: `Mutation`,
  fields: () => {
    return {
      createOperation: {
        type: GraphQLString,
        args: {
          commands: { type: GraphQLString },
        },
        resolve: (_data, args) => {
          applyPlan(JSON.parse(args.commands))
        },
      },
      applyOperationStep: {
        type: GraphQLString,
        resolve: () => {
          queue.resume()
        },
      },
    }
  },
})

const rootSubscriptionType = new GraphQLObjectType({
  name: `Subscription`,
  fields: () => {
    return {
      operation: {
        type: OperationType,
        subscribe: () => pubsub.asyncIterator(`operation`),
        resolve: payload => payload,
      },
    }
  },
})

const schema = new GraphQLSchema({
  query: rootQueryType,
  mutation: rootMutationType,
  subscription: rootSubscriptionType,
})

const app = express()
const server = createServer(app)

console.log(`listening on localhost:4000`)

app.use(
  `/graphql`,
  graphqlHTTP({
    schema,
    graphiql: true,
  })
)

server.listen(PORT, () => {
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server,
      path: `/graphql`,
    }
  )
})
