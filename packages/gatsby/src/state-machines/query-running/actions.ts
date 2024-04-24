import type { IQueryRunningContext } from "./types";
import {
  type DoneInvokeEvent,
  assign,
  type ActionFunctionMap,
  type AnyEventObject,
} from "xstate";
import { enqueueFlush } from "../../utils/page-data";

export function flushPageData(context: IQueryRunningContext): void {
  enqueueFlush(context.parentSpan);
}

export const assignDirtyQueries = assign<
  IQueryRunningContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DoneInvokeEvent<any>
>((_context, { data }) => {
  const { queryIds } = data;
  return {
    queryIds,
  };
});

export const markSourceFilesDirty = assign<IQueryRunningContext>({
  filesDirty: true,
});

export const markSourceFilesClean = assign<IQueryRunningContext>({
  filesDirty: false,
});

export const trackRequestedQueryRun = assign<
  IQueryRunningContext,
  AnyEventObject
>({
  pendingQueryRuns: (
    context: IQueryRunningContext,
    { payload }: AnyEventObject,
  ): Set<string> => {
    const pendingQueryRuns = context.pendingQueryRuns || new Set<string>();
    if (payload?.pagePath) {
      pendingQueryRuns.add(payload.pagePath);
    }
    return pendingQueryRuns;
  },
});

export const clearCurrentlyHandledPendingQueryRuns =
  assign<IQueryRunningContext>({
    currentlyHandledPendingQueryRuns: undefined,
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const queryActions: ActionFunctionMap<IQueryRunningContext, any> = {
  assignDirtyQueries,
  flushPageData,
  markSourceFilesDirty,
  markSourceFilesClean,
  trackRequestedQueryRun,
  clearCurrentlyHandledPendingQueryRuns,
};
