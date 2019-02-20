const _ = require(`lodash`)
const normalize = require(`normalize-path`)
const { Machine, interpret, actions } = require(`xstate`)
const { assign } = actions

const componentMachine = Machine(
  {
    id: `pageComponents`,
    initial: `inactive`,
    context: {
      isInBootstrap: true,
      componentPath: ``,
      query: ``,
    },
    states: {
      inactive: {
        on: {
          // Transient transition
          // Will transition to either 'inactiveWhileBootstrapping' or 'extractingQueries'
          // immediately upon entering 'inactive' state if the condition is met.
          "": [
            { target: `inactiveWhileBootstrapping`, cond: `isBootstrapping` },
            { target: `extractingQueries`, cond: `isNotBootstrapping` },
          ],
        },
      },
      inactiveWhileBootstrapping: {
        on: {
          BOOTSTRAP_FINISHED: {
            target: `extractingQueries`,
            actions: `setBootstrapFinished`,
          },
          QUERY_EXTRACTED: `queryExtracted`,
          QUERY_GRAPHQL_ERROR: `queryGraphQLError`,
        },
      },
      extractingQueries: {
        onEntry: [`extractQueries`],
        on: {
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          QUERY_EXTRACTED: `queryExtracted`,
          QUERY_GRAPHQL_ERROR: `queryGraphQLError`,
        },
      },
      queryGraphQLError: {
        on: {
          COMPONENT_CHANGED: `extractingQueries`,
          QUERY_EXTRACTED: `queryExtracted`,
        },
      },
      queryExtracted: {
        onEntry: [`setQuery`, `runPageComponentQueries`],
        on: {
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          COMPONENT_CHANGED: `extractingQueries`,
        },
      },
    },
  },
  {
    guards: {
      isBootstrapping: context => context.isInBootstrap,
      isNotBootstrapping: context => !context.isInBootstrap,
    },
    actions: {
      extractQueries: () => {
        const {
          debounceCompile,
        } = require(`../../internal-plugins/query-runner/query-watcher`)

        debounceCompile()
      },
      runPageComponentQueries: context => {
        const {
          queueQueriesForPageComponent,
        } = require(`../../internal-plugins/query-runner/query-watcher`)
        const {
          runQueuedActions,
        } = require(`../../internal-plugins/query-runner/page-query-runner`)
        console.log(
          `running queueQueriesForPageComponent`,
          queueQueriesForPageComponent,
          { context }
        )
        setTimeout(() => {
          queueQueriesForPageComponent(context.componentPath)
        }, 0)
      },
      setQuery: assign({
        query: (ctx, event) => event.query,
      }),
      setBootstrapFinished: assign({
        isInBootstrap: false,
      }),
    },
  }
)

const services = new Map()
let programStatus = `BOOTSTRAPPING`

module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()
    case `SET_PROGRAM_STATUS`:
      programStatus = action.payload
      console.log(`programStatus`, programStatus)
      services.forEach(s => s.send(`BOOTSTRAP_FINISHED`))
      return state
    case `CREATE_PAGE`: {
      action.payload.componentPath = normalize(action.payload.component)
      // Create XState service.
      if (!services.has(action.payload.componentPath)) {
        const machine = componentMachine.withContext({
          componentPath: action.payload.componentPath,
          query: ``,
          isInBootstrap: programStatus === `BOOTSTRAPPING`,
        })
        const service = interpret(machine).onTransition(nextState => {
          console.log(
            `component machine value`,
            _.pick(nextState, [`value`, `context`, `event`])
          )
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
