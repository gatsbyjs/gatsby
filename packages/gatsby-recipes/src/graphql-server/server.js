const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  execute,
  subscribe,
} = require(`graphql`)
const { PubSub } = require(`graphql-subscriptions`)
const { SubscriptionServer } = require(`subscriptions-transport-ws`)
const { createServer } = require(`http`)
const { interpret } = require(`xstate`)
const pkgDir = require(`pkg-dir`)
const cors = require(`cors`)

const recipeMachine = require(`../recipe-machine`)
const createTypes = require(`../create-types`)

const SITE_ROOT = pkgDir.sync(process.cwd())

const pubsub = new PubSub()
const PORT = process.argv[2] || 50400

const emitOperation = state => {
  console.log(state)
  pubsub.publish(`operation`, {
    state: JSON.stringify(state),
  })
}

// only one service can run at a time.
let service
const applyPlan = ({ recipePath, projectRoot }) => {
  const initialState = {
    context: { recipePath, projectRoot, steps: [], currentStep: 0 },
    value: `init`,
  }

  // Interpret the machine, and add a listener for whenever a transition occurs.
  service = interpret(
    recipeMachine.withContext(initialState.context)
  ).onTransition(state => {
    // Don't emit again unless there's a state change.
    console.log(`===onTransition`, {
      event: state.event,
      state: state.value,
      context: state.context,
      stepResources: state.context.stepResources,
      plan: state.context.plan,
    })
    if (state.changed) {
      console.log(`===state.changed`, {
        state: state.value,
        currentStep: state.context.currentStep,
      })
      // Wait until plans are created before updating the UI
      if (state.value !== `creatingPlan`) {
        emitOperation({
          context: state.context,
          lastEvent: state.event,
          value: state.value,
        })
      }
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

const { queryTypes, mutationTypes } = createTypes()

const rootQueryType = new GraphQLObjectType({
  name: `Root`,
  fields: () => queryTypes,
})

const rootMutationType = new GraphQLObjectType({
  name: `Mutation`,
  fields: () => {
    return {
      ...mutationTypes,
      createOperation: {
        type: GraphQLString,
        args: {
          recipePath: { type: GraphQLString },
          projectRoot: { type: GraphQLString },
        },
        resolve: (_data, args) => {
          console.log(`received operation`, args.recipePath)
          applyPlan(args)
        },
      },
      sendEvent: {
        type: GraphQLString,
        args: {
          event: { type: GraphQLString },
        },
        resolve: (_, args) => {
          console.log(`event received`, args)
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

app.use(cors())

app.use(
  `/graphql`,
  graphqlHTTP({
    schema,
    graphiql: true,
    context: { root: SITE_ROOT },
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
