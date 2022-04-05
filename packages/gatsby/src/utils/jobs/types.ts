interface IBaseJob {
  name: string
  outputDir: string
  args: Record<string, any>
}

interface IJobInput {
  inputPaths: Array<string>
  plugin: {
    name: string
    version: string
    resolve: string
  }
}

interface IInternalJob {
  id: string
  contentDigest: string
  inputPaths: Array<{
    path: string
    contentDigest: string
  }>
  plugin: {
    name: string
    version: string
    resolve: string
    isLocal: boolean
  }
}

export type JobInput = IBaseJob & IJobInput
export type InternalJob = IBaseJob & IInternalJob

export enum MESSAGE_TYPES {
  JOB_CREATED = `JOB_CREATED`,
  JOB_COMPLETED = `JOB_COMPLETED`,
  JOB_FAILED = `JOB_FAILED`,
  JOB_NOT_WHITELISTED = `JOB_NOT_WHITELISTED`,
}

export interface IJobCreatedMessage {
  type: MESSAGE_TYPES.JOB_CREATED
  payload: InternalJob
}

export interface IJobCompletedMessage {
  type: MESSAGE_TYPES.JOB_COMPLETED
  payload: {
    id: InternalJob["id"]
    result: Record<string, unknown>
  }
}

export interface IJobFailed {
  type: MESSAGE_TYPES.JOB_FAILED
  payload: {
    id: InternalJob["id"]
    error: Error
  }
}

export interface IJobNotWhitelisted {
  type: MESSAGE_TYPES.JOB_NOT_WHITELISTED
  payload: {
    id: InternalJob["id"]
  }
}

export class WorkerError extends Error {
  constructor(error: Error | string) {
    if (typeof error === `string`) {
      super(error)
    } else {
      // use error.message or else stringiyf the object so we don't get [Object object]
      super(error.message ?? JSON.stringify(error))
    }

    this.name = `WorkerError`

    if (typeof error === `string`) {
      Error.captureStackTrace(this, WorkerError)
    } else {
      // inherit stack from original error so actual stack trace persist
      this.stack = error.stack
    }
  }
}
