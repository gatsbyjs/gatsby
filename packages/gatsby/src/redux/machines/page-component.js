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
    on: {
      BOOTSTRAP_FINISHED: {
        actions: `setBootstrapFinished`,
      },
      DELETE_PAGE: {
        actions: `deletePage`,
      },
      NEW_PAGE_CREATED: {
        actions: `setPage`,
      },
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
          QUERY_CHANGED: `runningPageQueries`,
          QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
          QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
        },
      },
      extractingQueries: {
        onEntry: [`extractQueries`],
        on: {
          QUERY_CHANGED: `runningPageQueries`,
          QUERY_DID_NOT_CHANGE: `idle`,
          QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
          QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
        },
      },
      queryExtractionGraphQLError: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
        },
      },
      queryExtractionBabelError: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
        },
      },
      runningPageQueries: {
        onEntry: [`setQuery`, `runPageComponentQueries`],
        on: {
          QUERIES_COMPLETE: `idle`,
        },
      },
      idle: {
        on: {
          PAGE_COMPONENT_CHANGED: `extractingQueries`,
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
      runPageComponentQueries: (context, event) => {
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
            const {
              runQueryForPage,
            } = require(`../../internal-plugins/query-runner/query-watcher`)
            // Wait a bit as calling this function immediately triggers
            // an Action call which Redux squawks about.
            setTimeout(() => {
              if (!ctx.isInBootstrap) {
                runQueryForPage(event.path)
              }
            }, 0)

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
