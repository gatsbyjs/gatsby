import { emitter } from "../redux"
import { InvokeCallback, Sender } from "xstate"

export const listenForMutations: InvokeCallback = (callback: Sender<any>) => {
  const emitMutation = (event: unknown): void => {
    callback({ type: `ADD_NODE_MUTATION`, payload: event })
  }

  const emitFileChange = (event: unknown): void => {
    console.log({ event })
    callback({ type: `SOURCE_FILE_CHANGED`, payload: event })
  }

  emitter.on(`ENQUEUE_NODE_MUTATION`, emitMutation)

  emitter.on(`SOURCE_FILE_CHANGED`, emitFileChange)

  return (): void => {
    console.log(`unlistening`)
    emitter.off(`ENQUEUE_NODE_MUTATION`, emitMutation)

    emitter.off(`SOURCE_FILE_CHANGED`, emitFileChange)
  }
}
