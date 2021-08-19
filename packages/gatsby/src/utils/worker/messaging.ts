import { getMessenger, isWorker, IGatsbyWorkerMessenger } from "gatsby-worker"
import { ReporterMessagesFromChild } from "gatsby-cli/lib/reporter/types"
import {
  IJobCreatedMessage,
  IJobCompletedMessage,
  IJobFailed,
} from "../jobs/types"

export type MessagesFromParent = IJobCompletedMessage | IJobFailed
export type MessagesFromChild = IJobCreatedMessage | ReporterMessagesFromChild

export type GatsbyWorkerMessenger = IGatsbyWorkerMessenger<
  MessagesFromParent,
  MessagesFromChild
>

const getGatsbyMessenger = getMessenger as () =>
  | GatsbyWorkerMessenger
  | undefined

export { isWorker, getGatsbyMessenger as getMessenger }
