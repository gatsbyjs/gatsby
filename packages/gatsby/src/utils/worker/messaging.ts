import {
  getMessenger,
  isWorker,
  type IGatsbyWorkerMessenger,
} from "gatsby-worker";
import type { ReporterMessagesFromChild } from "gatsby-cli/lib/reporter/types";
import {
  type IJobCreatedMessage,
  type IJobCompletedMessage,
  MESSAGE_TYPES,
  type InternalJob,
} from "../jobs/types";

type IJobFailedSerialized = {
  type: MESSAGE_TYPES.JOB_FAILED;
  payload: {
    id: InternalJob["id"];
    error: string;
    stack?: string | undefined;
  };
};

export type MessagesFromParent = IJobCompletedMessage | IJobFailedSerialized;
export type MessagesFromChild = IJobCreatedMessage | ReporterMessagesFromChild;

export type GatsbyWorkerMessenger = IGatsbyWorkerMessenger<
  MessagesFromParent,
  MessagesFromChild
>;

const getGatsbyMessenger = getMessenger as () =>
  | GatsbyWorkerMessenger
  | undefined;

export { isWorker, getGatsbyMessenger as getMessenger };
