const {
  Machine,
  actions: { assign },
} = require(`xstate`)

module.exports = Machine(
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
          DELETE_PAGE: {
            actions: `deletePage`,
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
          DELETE_PAGE: {
            actions: `deletePage`,
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
          DELETE_PAGE: {
            actions: `deletePage`,
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
          DELETE_PAGE: {
            actions: `deletePage`,
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
        // Let page-query-runner.js handle running page component queries
        // until we're out of bootstrap.
        if (!context.isInBootstrap) {
          const {
            queueQueriesForPageComponent,
          } = require(`../../internal-plugins/query-runner/query-watcher`)
          // Wait a bit as calling this function immediately triggers
          // an Action call which Redux squawks about.
          setTimeout(() => {
            queueQueriesForPageComponent(context.componentPath)
          }, 0)
        }
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
      deletePage: assign({
        pages: (ctx, event) => ctx.pages.filter(p => p !== event.page.path),
      }),
      setBootstrapFinished: assign({
        isInBootstrap: false,
      }),
    },
  }
)
