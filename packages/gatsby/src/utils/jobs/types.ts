type IBaseJob = {
  name: string;
  outputDir: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>;
};

type IJobInput = {
  inputPaths: Array<string>;
  plugin?:
    | {
        name: string;
        version: string;
        resolve: string;
      }
    | undefined;
};

type IInternalJob = {
  id: string;
  contentDigest: string;
  inputPaths: Array<{
    path: string;
    contentDigest: string;
  }>;
  plugin: {
    name: string;
    version?: string | undefined;
    resolve?: string | undefined;
    isLocal: boolean;
  };
};

export type JobInput = IBaseJob & IJobInput;
export type InternalJob = IBaseJob & IInternalJob;

export enum MESSAGE_TYPES {
  JOB_CREATED = "JOB_CREATED",
  JOB_COMPLETED = "JOB_COMPLETED",
  JOB_FAILED = "JOB_FAILED",
  JOB_NOT_WHITELISTED = "JOB_NOT_WHITELISTED",
}

export type IJobCreatedMessage = {
  type: MESSAGE_TYPES.JOB_CREATED;
  payload: InternalJob;
};

export type IJobCompletedMessage = {
  type: MESSAGE_TYPES.JOB_COMPLETED;
  payload: {
    id: InternalJob["id"];
    result: Record<string, unknown>;
  };
};

export type IJobFailed = {
  type: MESSAGE_TYPES.JOB_FAILED;
  payload: {
    id: InternalJob["id"];
    error: Error;
  };
};

export type IJobNotWhitelisted = {
  type: MESSAGE_TYPES.JOB_NOT_WHITELISTED;
  payload: {
    id: InternalJob["id"];
  };
};

export class WorkerError extends Error {
  constructor(error: Error | string) {
    if (typeof error === "string") {
      super(error);
    } else {
      // use error.message or else stringiyf the object so we don't get [Object object]
      super(error.message ?? JSON.stringify(error));
    }

    this.name = "WorkerError";

    if (typeof error === "string") {
      Error.captureStackTrace(this, WorkerError);
    } else {
      // inherit stack from original error so actual stack trace persist
      // @ts-ignore
      this.stack = error.stack;
    }
  }
}
