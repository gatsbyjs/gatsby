import dotenv from "dotenv"

import express from "express"
import chokidar from "chokidar"
import graphqlHTTP from "express-graphql"

import { v4 as uuidv4 } from "uuid"
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  execute,
  subscribe,
} from "graphql"
import { PubSub } from "graphql-subscriptions"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { createServer } from "http"
import { interpret } from "xstate"
import pkgDir from "pkg-dir"
import cors from "cors"
import lodash from "lodash"

import recipeMachine from "../recipe-machine"
import createTypes from "../create-types"

dotenv.config()
// Create a session id — mostly useful to tell the client when the server
// has restarted
const sessionId = uuidv4()

const SITE_ROOT = pkgDir.sync(process.cwd())

const pubsub = new PubSub()
const PORT = process.argv[2] || 50400

let lastState = {}
let lastDone = 0

const compareState = (oldState, newState) => {
  // isEqual doesn't handle values on objects in arrays 🤷‍♀️
  const newDone = newState.context.plan.filter(r => r.isDone).length
  const comparison = !lodash.isEqual(newState, oldState) || lastDone !== newDone
  lastDone = newDone

  return comparison
}

const emitUpdate = state => {
  // eslint-disable-next-line no-unused-vars
  const { lastEvent, ...cleanedState } = state
  // isEqual doesn't handle values on objects in arrays 🤷‍♀️
  if (compareState(lastState, cleanedState)) {
    pubsub.publish(`operation`, {
      state: JSON.stringify(cleanedState),
    })

    lastState = cleanedState
  }
}

let service
const startRecipe = ({ recipePath, projectRoot, watchChanges = false }) => {
  const initialState = {
    context: { recipePath, projectRoot, steps: [], currentStep: 0 },
    value: `init`,
  }

  const startService = () => {
    // Interpret the machine, and add a listener for whenever a transition occurs.
    service = interpret(
      recipeMachine.withContext(initialState.context)
    ).onTransition(state => {
      // Don't emit again unless there's a state change.
      if (state.event.type !== `onUpdate`) {
        console.log(`===onTransition`, {
          state: state.value,
          event: state.event.type,
        })
      }
      if (state.changed) {
        console.log(`===state.changed`, {
          state: state.value,
          event: state.event.type,
        })
        if (state.value === `doneError`) {
          console.log(state.event)
        }
        // Wait until plans are created before updating the UI
        if (
          [`presentPlan`, `done`, `doneError`, `applyingPlan`].includes(
            state.value
          )
        ) {
          emitUpdate({
            context: state.context,
            lastEvent: state.event,
            value: state.value,
          })
        }
      }

      if (state.value === `done`) {
        service.stop()
      }
    })

    // Start the service
    try {
      service.start()
    } catch (e) {
      console.log(`recipe machine failed to start`, e)
    }
  }

  if (watchChanges) {
    chokidar
      .watch(initialState.context.recipePath)
      .on(`change`, (filename, stats) => {
        startService()
      })
  }

  startService()
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
          watchChanges: { type: GraphQLBoolean },
        },
        resolve: (_data, args) => {
          console.log(`received operation`, args)
          startRecipe(args)
        },
      },
      sendEvent: {
        type: GraphQLString,
        args: {
          event: { type: GraphQLString },
          input: { type: GraphQLString },
        },
        resolve: (_, args) => {
          console.log(`!!! event received`, args)
          service.send({
            type: args.event,
            data: args.input && JSON.parse(args.input),
          })
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

console.log(`listening on localhost:${PORT}`)

app.use(cors())

app.use(
  `/graphql`,
  graphqlHTTP({
    schema,
    graphiql: true,
    context: { root: SITE_ROOT },
  })
)

app.use(`/session`, (req, res) => {
  res.send(sessionId)
})

// DEBUGGING
app.use(`/service`, (req, res) => {
  res.json(service)
})

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
