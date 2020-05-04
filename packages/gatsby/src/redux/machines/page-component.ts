import { Machine as machine, assign, AnyEventObject } from "xstate"

interface IContext {
  isInBootstrap: boolean
  componentPath: string
  query: string
  pages: Set<string>
}

const defaultContext: IContext = {
  isInBootstrap: true,
  componentPath: ``,
  query: ``,
  pages: new Set(``),
}

const compoenentMachine = machine<IContext>(
  {
    id: `pageComponents`,
    initial: `inactive`,
    context: defaultContext,
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
      PAGE_CONTEXT_MODIFIED: {
        actions: `rerunPageQuery`,
      },
      QUERY_EXTRACTION_GRAPHQL_ERROR: `queryExtractionGraphQLError`,
      QUERY_EXTRACTION_BABEL_ERROR: `queryExtractionBabelError`,
    },
    states: {
      inactive: {
        on: {
          // Transient transition
          // Will transition to either 'inactiveWhileBootstrapping' or idle
          // immediately upon entering 'inactive' state if the condition is met.
          "": [
            { target: `inactiveWhileBootstrapping`, cond: `isBootstrapping` },
            { target: `idle`, cond: `isNotBootstrapping` },
          ],
        },
      },
      inactiveWhileBootstrapping: {
        on: {
          BOOTSTRAP_FINISHED: {
            target: `idle`,
            actions: `setBootstrapFinished`,
          },
          QUERY_CHANGED: `runningPageQueries`,
        },
      },
      queryExtractionGraphQLError: {
        on: {
          QUERY_DID_NOT_CHANGE: `idle`,
          QUERY_CHANGED: `runningPageQueries`,
        },
      },
      queryExtractionBabelError: {
        on: {
          QUERY_EXTRACTION_BABEL_SUCCESS: `idle`,
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
          QUERY_CHANGED: `runningPageQueries`,
        },
      },
    },
  },
  {
    guards: {
      isBootstrapping: (context): boolean => context.isInBootstrap,
      isNotBootstrapping: (context): boolean => !context.isInBootstrap,
    },
    actions: {
      rerunPageQuery: (_ctx, event): void => {
        const queryUtil = require(`../../query`)
        // Wait a bit as calling this function immediately triggers
        // an Action call which Redux squawks about.
        setTimeout(() => {
          queryUtil.enqueueExtractedQueryId(event.path)
        }, 0)
      },
      runPageComponentQueries: (context): void => {
        const queryUtil = require(`../../query`)
        // Wait a bit as calling this function immediately triggers
        // an Action call which Redux squawks about.
        setTimeout(() => {
          queryUtil.enqueueExtractedPageComponent(context.componentPath)
        }, 0)
      },
      setQuery: assign({
        query: (ctx, event: AnyEventObject) => {
          if (typeof event.query !== `undefined` || event.query !== null) {
            return event.query
          } else {
            return ctx.query
          }
        },
      }),
      setPage: assign({
        pages: (ctx, event: AnyEventObject) => {
          if (event.path) {
            const queryUtil = require(`../../query`)
            // Wait a bit as calling this function immediately triggers
            // an Action call which Redux squawks about.
            setTimeout(() => {
              if (!ctx.isInBootstrap) {
                queryUtil.enqueueExtractedQueryId(event.path)
                queryUtil.runQueuedQueries(event.path)
              }
            }, 0)
            ctx.pages.add(event.path)
            return ctx.pages
          } else {
            return ctx.pages
          }
        },
      }),
      deletePage: assign({
        pages: (ctx, event: AnyEventObject) => {
          ctx.pages.delete(event.page.path)
          return ctx.pages
        },
      }),
      setBootstrapFinished: assign({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isInBootstrap: (_ctx, _event): boolean => false,
      }),
    },
  }
)

export default compoenentMachine
