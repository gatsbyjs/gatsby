import { getMessenger, isWorker, IGatsbyWorkerMessenger } from "gatsby-worker"
import { ReporterMessagesFromChild } from "gatsby-cli/lib/reporter/types"
import {
  IJobCreatedMessage,
  IJobCompletedMessage,
  MESSAGE_TYPES,
  InternalJob,
} from "../jobs/types"

interface IJobFailedSerialized {
  type: MESSAGE_TYPES.JOB_FAILED
  payload: {
    id: InternalJob["id"]
    error: string
    stack?: string
  }
}

export type MessagesFromParent = IJobCompletedMessage | IJobFailedSerialized
export type MessagesFromChild = IJobCreatedMessage | ReporterMessagesFromChild

export type GatsbyWorkerMessenger = IGatsbyWorkerMessenger<
  MessagesFromParent,
  MessagesFromChild
>

const getGatsbyMessenger = getMessenger as () =>
  | GatsbyWorkerMessenger
  | undefined

export { isWorker, getGatsbyMessenger as getMessenger }
