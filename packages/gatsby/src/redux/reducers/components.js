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
          QUERY_EXTRACTED: `runningPageQueries`,
          QUERY_GRAPHQL_ERROR: `queryGraphQLError`,
        },
      },
      extractingQueries: {
        onEntry: [`extractQueries`],
        on: {
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          QUERY_CHANGED: `runningPageQueries`,
          QUERY_DID_NOT_CHANGE: `idle`,
          QUERY_GRAPHQL_ERROR: `queryGraphQLError`,
        },
      },
      queryGraphQLError: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
        },
      },
      runningPageQueries: {
        onEntry: [`setQuery`, `runPageComponentQueries`],
        on: {
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          QUERIES_COMPLETE: `idle`,
        },
      },
      idle: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
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
        // Wait a bit as calling this function immediately triggers
        // an Action call which Redux squawks about.
        setTimeout(() => {
          queueQueriesForPageComponent(context.componentPath)
        }, 0)
      },
      setQuery: assign({
        query: (ctx, event) => {
          if (event.query) {
            return event.query
          } else {
            return ctx.query
          }
        },
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
      services.forEach(s => s.send(`BOOTSTRAP_FINISHED`))
      return state
    case `CREATE_PAGE`: {
      action.payload.componentPath = normalize(action.payload.component)
      // Create XState service.
      let service
      if (!services.has(action.payload.componentPath)) {
        const machine = componentMachine.withContext({
          componentPath: action.payload.componentPath,
          query: ``,
          isInBootstrap: programStatus === `BOOTSTRAPPING`,
        })
        service = interpret(machine)
          .onTransition(nextState => {
            console.log(
              `component machine value`,
              _.pick(nextState, [`value`, `context`, `event`])
            )
          })
          .start()
        services.set(action.payload.componentPath, service)
      } else {
        service = services.get(action.payload.componentPath)
      }

      state.set(
        action.payload.componentPath,
        _.merge(
          {
            query: ``,
          },
          service.state.context,
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

      // Check if we're in bootstrap or not
      if (service.state.context.isInBootstrap) {
        // See if the query changed or not.
        service.send({
          type: `QUERY_EXTRACTED`,
          query: action.payload.query,
        })
      } else {
        // Check if the query has changed or not.
        if (service.state.context.query === action.payload.query) {
          service.send(`QUERY_DID_NOT_CHANGE`)
        } else {
          service.send({
            type: `QUERY_CHANGED`,
            query: action.payload.query,
          })
        }
      }
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
    case `PAGE_COMPONENT_CHANGED`: {
      action.payload = normalize(action.payload)
      const service = services.get(action.payload)
      service.send({
        type: `PAGE_COMPONENT_CHANGED`,
      })
      services.set(action.payload, service)
      return state
    }
    case `PAGE_QUERY_RUN`: {
      action.payload.componentPath = normalize(action.payload.componentPath)
      const service = services.get(action.payload.componentPath)
      // TODO we want to keep track of whether there's any outstanding queries still
      // running as this will mark queries as complete immediately even though
      // a page component could have thousands of pages will processing.
      // This can be done once we start modeling Pages as well.
      service.send({
        type: `QUERIES_COMPLETE`,
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
