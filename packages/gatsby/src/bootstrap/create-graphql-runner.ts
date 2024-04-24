import stackTrace from "stack-trace";
import { Span } from "opentracing";
import { type ExecutionResult, Source } from "graphql";
import type { Store } from "redux";

import { GraphQLRunner } from "../query/graphql-runner";
import errorParser from "../query/error-parser";
import { emitter } from "../redux";
import type { Reporter } from "../..";
import type { IGatsbyState } from "../redux/types";
import type { IMatch } from "../types";

export type Runner = (
  query: string | Source,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any>,
) => Promise<ExecutionResult>;

export function createGraphQLRunner(
  store: Store<IGatsbyState>,
  reporter: Reporter,
  {
    parentSpan,
    graphqlTracing,
  }: { parentSpan?: Span | undefined; graphqlTracing?: boolean | undefined } = {
    parentSpan: undefined,
    graphqlTracing: false,
  },
): Runner {
  // TODO: Move tracking of changed state inside GraphQLRunner itself. https://github.com/gatsbyjs/gatsby/issues/20941
  let runner: GraphQLRunner | undefined = new GraphQLRunner(store, {
    graphqlTracing,
  });

  const eventTypes: Array<string> = [
    "DELETE_CACHE",
    "CREATE_NODE",
    "DELETE_NODE",
    "SET_SCHEMA_COMPOSER",
    "SET_SCHEMA",
    "ADD_FIELD_TO_NODE",
    "ADD_CHILD_NODE_TO_PARENT_NODE",
  ];

  eventTypes.forEach((type) => {
    emitter.on(type, () => {
      runner = undefined;
    });
  });

  return (query, context): ReturnType<Runner> => {
    if (!runner) {
      runner = new GraphQLRunner(store, {
        graphqlTracing,
      });
    }
    return runner
      .query(query, context, {
        queryName: "gatsby-node query",
        parentSpan,
      })
      .then((result) => {
        if (result.errors) {
          const structuredErrors: Array<IMatch> = result.errors
            .map((e) => {
              // Find the file where graphql was called.
              const file = stackTrace
                .parse(e)
                .find((file) => /createPages/.test(file.getFunctionName()));

              if (file) {
                const structuredError = errorParser({
                  message: e.message,
                  location: {
                    start: {
                      line: file.getLineNumber(),
                      column: file.getColumnNumber(),
                    },
                  },
                  filePath: file.getFileName(),
                  error: e,
                });
                structuredError.context = {
                  ...structuredError.context,
                  fromGraphQLFunction: true,
                };
                return structuredError;
              }

              return null;
            })
            .filter(Boolean) as Array<IMatch>;

          if (structuredErrors.length) {
            // panic on build exits the process
            // @ts-ignore
            reporter.panicOnBuild(structuredErrors);
          }
        }

        return result;
      });
  };
}
