import { assign, type DoneInvokeEvent, type ActionFunctionMap } from "xstate";
import { createGraphQLRunner } from "../../bootstrap/create-graphql-runner";
import reporter from "gatsby-cli/lib/reporter";
import type { IDataLayerContext } from "./types";
import { assertStore } from "../../utils/assert-store";
import { GraphQLRunner } from "../../query/graphql-runner";

function concatUnique<T>(
  array1: Array<T> = [],
  array2: Array<T> = [],
): Array<T> {
  return Array.from(new Set(array1.concat(array2)));
}

export const assignChangedPages = assign<
  IDataLayerContext,
  DoneInvokeEvent<{
    changedPages: Array<string>;
    deletedPages: Array<string>;
  }>
>((context, event) => {
  return {
    pagesToBuild: concatUnique(context.pagesToBuild, event.data.changedPages),
    pagesToDelete: concatUnique(context.pagesToDelete, event.data.deletedPages),
  };
});

export const assignGraphQLRunners = assign<IDataLayerContext>(
  ({ store, program }) => {
    assertStore(store);
    return {
      gatsbyNodeGraphQLFunction: createGraphQLRunner(store, reporter),
      graphqlRunner: new GraphQLRunner(store, {
        collectStats: true,
        graphqlTracing: program?.graphqlTracing ?? false,
      }),
    };
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataLayerActions: ActionFunctionMap<IDataLayerContext, any> = {
  assignChangedPages,
  assignGraphQLRunners,
};
