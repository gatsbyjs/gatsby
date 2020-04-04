const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
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
const { interpret } = require(`xstate`)

const recipeMachine = require(`./recipe-machine`)

const SITE_ROOT = process.cwd()

const read = promisify(fs.readFile)

const pubsub = new PubSub()
const PORT = 4000

let queue = new Queue(async (action, cb) => {
  await applyStep(action)
  cb()
})

queue.pause()

const readPackage = async () => {
  const contents = await read(path.join(SITE_ROOT, `package.json`), `utf8`)
  return JSON.parse(contents)
}

const emitOperation = state => {
  pubsub.publish(`operation`, {
    state: JSON.stringify(state),
  })
}

// only one service can run at a time.
let service
const applyPlan = plan => {
  // plan.forEach(step => queue.push({ plan, ...step }))

  // queue.on(`drain`, () => {
  // emitOperation(`success`, plan)
  // })
  const initialState = {
    context: { steps: plan, currentStep: 0 },
    value: `init`,
  }
  emitOperation(initialState)

  // Interpret the machine, and add a listener for whenever a transition occurs.
  service = interpret(
    recipeMachine.withContext(initialState.context)
  ).onTransition(state => {
    // Don't emit again unless there's a state change.
    console.log(`===onTransition`, { event: state.event, state: state.value })
    if (state.changed) {
      console.log(`===state.changed`, {
        state: state.value,
        currentStep: state.context.currentStep,
      })
      emitOperation({
        context: state.context,
        lastEvent: state.event,
        value: state.value,
      })
    }
  })

  // Start the service
  try {
    service.start()
  } catch (e) {
    console.log(`recipe machine failed to start`, e)
  }
}

const OperationType = new GraphQLObjectType({
  name: `Operation`,
  fields: {
    state: { type: GraphQLString },
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
          const commands = JSON.parse(args.commands)
          console.log('received operation', commands)
          applyPlan(commands)
        },
      },
      sendEvent: {
        type: GraphQLString,
        args: {
          event: { type: GraphQLString },
        },
        resolve: (_, args) => {
          console.log('event received', args)
          service.send(args.event)
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
