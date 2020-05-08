import { Machine as machine, assign } from "xstate"

export interface IContext {
  isInBootstrap: boolean
  componentPath: string
  query: string
  pages: Set<string>
}

export interface IState {
  states: {
    inactive: {}
    inactiveWhileBootstrapping: {}
    queryExtractionGraphQLError: {}
    queryExtractionBabelError: {}
    runningPageQueries: {}
    idle: {}
  }
}

/**
 * Stricter types for actions are not possible
 * as we have different payloads that would require casting.
 * The current approach prevents this but makes all payloads optional.
 * See https://github.com/gatsbyjs/gatsby/pull/23277#issuecomment-625425023
 */

type ActionTypes =
  | "BOOTSTRAP_FINISHED"
  | "DELETE_PAGE"
  | "NEW_PAGE_CREATED"
  | "PAGE_CONTEXT_MODIFIED"
  | "QUERY_EXTRACTION_GRAPHQL_ERROR"
  | "QUERY_EXTRACTION_BABEL_ERROR"
  | "QUERY_EXTRACTION_BABEL_SUCCESS"
  | "QUERY_CHANGED"
  | "QUERY_DID_NOT_CHANGE"
  | "QUERIES_COMPLETE"

export interface IEvent {
  type: ActionTypes
  path?: string
  query?: string
  page?: { path: string }
}

const defaultContext: IContext = {
  isInBootstrap: true,
  componentPath: ``,
  query: ``,
  pages: new Set(``),
}

export const componentMachine = machine<IContext, IState, IEvent>(
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
        query: (ctx, event): string => {
          if (typeof event.query !== `undefined` && event.query !== null) {
            return event.query
          } else {
            return ctx.query
          }
        },
      }),
      setPage: assign({
        pages: (ctx, event) => {
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
        pages: (ctx, event) => {
          ctx.pages.delete(event.page!.path)
          return ctx.pages
        },
      }),
      setBootstrapFinished: assign<IContext>({
        isInBootstrap: false,
      }),
    },
  }
)
