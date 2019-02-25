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
          QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
          QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
          NEW_PAGE_CREATED: {
            actions: `setPage`,
          },
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
          QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
          QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
          NEW_PAGE_CREATED: {
            actions: `setPage`,
          },
        },
      },
      queryExtractionGraphQLError: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
        },
      },
      queryExtractionBabelError: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
        },
      },
      runningPageQueries: {
        onEntry: [`setQuery`, `runPageComponentQueries`],
        on: {
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          QUERIES_COMPLETE: `idle`,
          NEW_PAGE_CREATED: {
            actions: `setPage`,
          },
        },
      },
      idle: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
          BOOTSTRAP_FINISHED: {
            actions: `setBootstrapFinished`,
          },
          NEW_PAGE_CREATED: {
            actions: `setPage`,
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
          if (typeof event.query !== `undefined` || event.query !== null) {
            return event.query
          } else {
            return ctx.query
          }
        },
      }),
      setPage: assign({
        pages: (ctx, event) => {
          if (event.path) {
            return ctx.pages.concat(event.path)
          } else {
            return ctx.pages
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
          pages: [action.payload.path],
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
        // Check if this is a new page — if so, run its query.
        if (!_.includes(service.state.context.pages, action.payload.path)) {
          service.send({ type: `NEW_PAGE_CREATED`, path: action.payload.path })
          // Run query for the new page.
          const {
            runQueryForPage,
          } = require(`../../internal-plugins/query-runner/query-watcher`)
          // Wait a bit as calling this function immediately triggers
          // an Action call which Redux squawks about.
          setTimeout(() => {
            runQueryForPage(action.payload.path)
          }, 0)
        }
      }

      state.set(
        action.payload.componentPath,
        _.merge(
          {
            query: ``,
          },
          service.state.context
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
        ...service.state.context,
      })
      return state
    }
    case `PAGE_COMPONENT_CHANGED`:
    case `QUERY_EXTRACTION_BABEL_ERROR`:
    case `QUERY_EXTRACTION_GRAPHQL_ERROR`: {
      action.payload.componentPath = normalize(action.payload.componentPath)
      const service = services.get(action.payload.componentPath)
      service.send({
        type: action.type,
        ...action.payload,
      })
      services.set(action.payload.componentPath, service)
      return state
    }
    case `PAGE_QUERY_RUN`: {
      if (action.payload.isPage) {
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
      }
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
