import { emitter } from "../redux"
import { InvokeCallback, Sender } from "xstate"

export const listenForMutations: InvokeCallback = (callback: Sender<any>) => {
  const emitMutation = (event: unknown): void => {
    callback({ type: `ADD_NODE_MUTATION`, payload: event })
  }

  const emitSourceChange = (event: unknown): void => {
    callback({ type: `SOURCE_FILE_CHANGED`, payload: event })
  }

  const emitWebhook = (event: unknown): void => {
    callback({ type: `WEBHOOK_RECEIVED`, payload: event })
  }

  const emitQueryRunRequest = (event: unknown): void => {
    callback({ type: `QUERY_RUN_REQUESTED`, payload: event })
  }

  emitter.on(`ENQUEUE_NODE_MUTATION`, emitMutation)
  emitter.on(`WEBHOOK_RECEIVED`, emitWebhook)
  emitter.on(`SOURCE_FILE_CHANGED`, emitSourceChange)
  emitter.on(`QUERY_RUN_REQUESTED`, emitQueryRunRequest)

  return function unsubscribeFromMutationListening(): void {
    emitter.off(`ENQUEUE_NODE_MUTATION`, emitMutation)
    emitter.off(`WEBHOOK_RECEIVED`, emitWebhook)
    emitter.off(`SOURCE_FILE_CHANGED`, emitSourceChange)
    emitter.off(`QUERY_RUN_REQUESTED`, emitQueryRunRequest)
  }
}
