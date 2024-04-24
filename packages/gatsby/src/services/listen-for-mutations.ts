import { emitter } from "../redux";
import type { InvokeCallback, Sender } from "xstate";

export const listenForMutations: InvokeCallback = function listenForMutations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: Sender<any>,
) {
  function emitMutation(event: unknown): void {
    callback({ type: "ADD_NODE_MUTATION", payload: event });
  }

  function emitSourceChange(event: unknown): void {
    callback({ type: "SOURCE_FILE_CHANGED", payload: event });
  }

  function emitWebhook(event: unknown): void {
    callback({ type: "WEBHOOK_RECEIVED", payload: event });
  }

  function emitQueryRunRequest(event: unknown): void {
    callback({ type: "QUERY_RUN_REQUESTED", payload: event });
  }

  function emitSetSchema(event: unknown): void {
    callback({ type: "SET_SCHEMA", payload: event });
  }

  function emitGraphQLDefinitions(event: unknown): void {
    callback({ type: "SET_GRAPHQL_DEFINITIONS", payload: event });
  }

  emitter.on("ENQUEUE_NODE_MUTATION", emitMutation);
  emitter.on("WEBHOOK_RECEIVED", emitWebhook);
  emitter.on("SOURCE_FILE_CHANGED", emitSourceChange);
  emitter.on("QUERY_RUN_REQUESTED", emitQueryRunRequest);
  emitter.on("SET_SCHEMA", emitSetSchema);
  emitter.on("SET_GRAPHQL_DEFINITIONS", emitGraphQLDefinitions);

  return function unsubscribeFromMutationListening(): void {
    emitter.off("ENQUEUE_NODE_MUTATION", emitMutation);
    emitter.off("WEBHOOK_RECEIVED", emitWebhook);
    emitter.off("SOURCE_FILE_CHANGED", emitSourceChange);
    emitter.off("QUERY_RUN_REQUESTED", emitQueryRunRequest);
    emitter.off("SET_SCHEMA", emitSetSchema);
    emitter.off("SET_GRAPHQL_DEFINITIONS", emitGraphQLDefinitions);
  };
};
