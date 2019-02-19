const _ = require(`lodash`)
const normalize = require(`normalize-path`)
const { Machine, interpret, actions } = require(`xstate`)

const { assign } = actions

const componentMachine = Machine(
  {
    id: "pageComponents",
    initial: "extractingQueries",
    context: {
      componentPath: ``,
      query: ``,
    },
    states: {
      extractingQueries: {
        onEntry: ["extractQueries"],
        on: {
          QUERY_EXTRACTED: `queryExtracted`,
          QUERY_GRAPHQL_ERROR: `queryGraphQLError`,
        },
      },
      queryExtracted: {
        onEntry: ["setQuery", "runPageComponentQueries"],
        on: {
          COMPONENT_CHANGED: "extractingQueries",
        },
      },
      queryGraphQLError: {
        on: {
          COMPONENT_CHANGED: "extractingQueries",
          QUERY_EXTRACTED: "queryExtracted",
        },
      },
    },
  },
  {
    actions: {
      extractQueries() {
        console.log(`call extractQueries`)
      },
      runPageComponentQueries: () => console.log(`runPageComponentQueries`),
      setQuery: assign({
        query: (ctx, event) => event.query,
      }),
    },
  }
)

const services = new Map()

module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()
    case `CREATE_PAGE`: {
      action.payload.componentPath = normalize(action.payload.component)
      // Create XState service.
      if (!services.has(action.payload.componentPath)) {
        const machine = componentMachine.withContext({
          componentPath: action.payload.componentPath,
          query: ``,
        })
        const service = interpret(machine).onTransition(nextState => {
          console.log(`component machine value`, nextState)
        })
        service.start()
        services.set(action.payload.componentPath, service)
      }

      state.set(
        action.payload.componentPath,
        _.merge(
          {
            query: ``,
          },
          state.get(action.payload.componentPath),
          {
            componentPath: action.payload.componentPath,
          }
        )
      )
      return state
    }
    case `QUERY_EXTRACTED`: {
      action.payload.componentPath = normalize(action.payload.componentPath)
      const service = services.get(action.payload.componentPath)
      service.send({
        type: `QUERY_EXTRACTED`,
        query: action.payload.query,
      })
      services.set(action.payload.componentPath, service)
      state.set(action.payload.componentPath, {
        ...state.get(action.payload.componentPath),
        query: action.payload.query,
      })
      return state
    }
    case `QUERY_GRAPHQL_ERROR`: {
      action.payload.componentPath = normalize(action.payload.componentPath)
      const service = services.get(action.payload.componentPath)
      service.send({
        type: `QUERY_GRAPHQL_ERROR`,
        error: action.payload.error,
      })
      services.set(action.payload.componentPath, service)
      return state
    }
    case `REMOVE_TEMPLATE_COMPONENT`: {
      action.payload.componentPath = normalize(action.payload.componentPath)
      state.delete(action.payload.componentPath)
      return state
    }
  }

  return state
}
