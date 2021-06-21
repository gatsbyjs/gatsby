import { Worker } from "worker_threads"
import {
  EXECUTE,
  ERROR,
  RESULT,
  CUSTOM_MESSAGE,
  ParentMessageUnion,
  ChildMessageUnion,
} from "./types"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Process {
      gatsbyWorker?: {
        onMessage: (listener: (msg: unknown) => void) => void
        sendMessage: (msg: unknown) => void
      }
    }
  }
}

interface IWorkerOptions {
  numWorkers: number
  env?: Record<string, string>
}

type WrapReturnOfAFunctionInAPromise<
  FunctionThatDoesNotReturnAPromise extends (...args: Array<any>) => any
> = (
  ...a: Parameters<FunctionThatDoesNotReturnAPromise>
) => Promise<ReturnType<FunctionThatDoesNotReturnAPromise>>

// gatsby-worker will make sync function async, so to keep proper types we need to adjust types so all functions
// on worker pool are async
type EnsureFunctionReturnsAPromise<MaybeFunction> = MaybeFunction extends (
  ...args: Array<any>
) => Promise<any>
  ? MaybeFunction
  : MaybeFunction extends (...args: Array<any>) => any
  ? WrapReturnOfAFunctionInAPromise<MaybeFunction>
  : never

type WrapReturnInArray<MaybeFunction> = MaybeFunction extends (
  ...args: Array<any>
) => any
  ? (...a: Parameters<MaybeFunction>) => Array<ReturnType<MaybeFunction>>
  : never

export type CreateWorkerPoolType<ExposedFunctions> = WorkerPool &
  {
    [FunctionName in keyof ExposedFunctions]: EnsureFunctionReturnsAPromise<
      ExposedFunctions[FunctionName]
    >
  } & {
    all: {
      [FunctionName in keyof ExposedFunctions]: WrapReturnInArray<
        EnsureFunctionReturnsAPromise<ExposedFunctions[FunctionName]>
      >
    }
  }

const childWrapperPath = require.resolve(`./child`)

class TaskInfo<T> {
  functionName: T
  args: Array<any>
  assignedToWorker?: IWorkerInfo<T>
  promise: Promise<any>
  resolve!: (r: any) => void
  reject!: (e: Error) => void

  constructor(opts: {
    functionName: T
    args: Array<any>
    assignedToWorker?: IWorkerInfo<T>
  }) {
    this.functionName = opts.functionName
    this.args = opts.args
    this.assignedToWorker = opts.assignedToWorker
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

interface IWorkerInfo<T> {
  workerId: number
  worker: Worker
  currentTask?: TaskInfo<T>
}

export class WorkerPool<WorkerModuleExports = Record<string, unknown>> {
  all: {
    [FunctionName in keyof WorkerModuleExports]: WrapReturnInArray<
      EnsureFunctionReturnsAPromise<WorkerModuleExports[FunctionName]>
    >
  }

  single: {
    [FunctionName in keyof WorkerModuleExports]: EnsureFunctionReturnsAPromise<
      WorkerModuleExports[FunctionName]
    >
  }

  private workers: Array<IWorkerInfo<keyof WorkerModuleExports>> = []
  private taskQueue: Array<TaskInfo<keyof WorkerModuleExports>> = []
  private idleWorkers: Set<IWorkerInfo<keyof WorkerModuleExports>> = new Set()
  private listeners: Array<(msg: unknown, workerId: number) => void> = []

  constructor(workerPath: string, options?: IWorkerOptions) {
    const single: Partial<WorkerPool<WorkerModuleExports>["single"]> = {}
    const all: Partial<WorkerPool<WorkerModuleExports>["all"]> = {}

    {
      // we don't need to retain these
      const module: WorkerModuleExports = require(workerPath)
      const exportNames = Object.keys(module) as Array<
        keyof WorkerModuleExports
      >

      for (const exportName of exportNames) {
        if (typeof module[exportName] !== `function`) {
          // we only expose functions
          continue
        }

        single[exportName] = this.scheduleWorkSingle.bind(
          this,
          exportName
        ) as WorkerPool<WorkerModuleExports>["single"][typeof exportName]

        all[exportName] = (this.scheduleWorkAll.bind(
          this,
          exportName
        ) as unknown) as WorkerPool<
          WorkerModuleExports
        >["all"][typeof exportName]
      }
    }

    this.single = single as WorkerPool<WorkerModuleExports>["single"]
    this.all = all as WorkerPool<WorkerModuleExports>["all"]

    for (let workerId = 1; workerId <= (options?.numWorkers ?? 1); workerId++) {
      const worker = new Worker(childWrapperPath, {
        env: {
          ...process.env,
          ...(options?.env ?? {}),
          GATSBY_WORKER_ID: workerId.toString(),
        },
        workerData: {
          moduleToExecute: workerPath,
          workerId,
        },
      })
      const workerInfo: IWorkerInfo<keyof WorkerModuleExports> = {
        workerId,
        worker,
      }

      worker.on(`message`, (msg: ChildMessageUnion) => {
        if (!workerInfo.currentTask) {
          throw new Error(`worker finished work but no idea what work :shrug:`)
        }

        if (msg[0] === RESULT) {
          const task = workerInfo.currentTask
          workerInfo.currentTask = undefined
          this.checkForWork(workerInfo)
          task.resolve(msg[1])
        } else if (msg[0] === ERROR) {
          let error = msg[4]

          if (error !== null && typeof error === `object`) {
            const extra = error

            const NativeCtor = global[msg[1]]
            const Ctor = typeof NativeCtor === `function` ? NativeCtor : Error

            error = new Ctor(msg[2])
            // @ts-ignore type doesn't exist on Error, but that's what jest-worker does for errors :shrug:
            error.type = msg[1]
            error.stack = msg[3]

            for (const key in extra) {
              if (Object.prototype.hasOwnProperty.call(extra, key)) {
                error[key] = extra[key]
              }
            }
          }

          const task = workerInfo.currentTask
          workerInfo.currentTask = undefined
          this.checkForWork(workerInfo)
          task.reject(error)
        } else if (msg[0] === CUSTOM_MESSAGE) {
          for (const listener of this.listeners) {
            listener(msg[1], workerId)
          }
        }
      })

      this.workers.push(workerInfo)
      this.idleWorkers.add(workerInfo)
    }
  }

  end(): Array<Promise<number>> {
    return this.workers.map(workerInfo => workerInfo.worker.terminate())
  }

  private checkForWork<T extends keyof WorkerModuleExports>(
    workerInfo: IWorkerInfo<T>
  ): void {
    // check if there is task in queue
    for (let i = 0; i < this.taskQueue.length; i++) {
      const task = this.taskQueue[i]
      if (!task.assignedToWorker || task.assignedToWorker === workerInfo) {
        this.doWork(task, workerInfo)
        this.taskQueue.splice(i, 1)

        return
      }
    }

    // no task found, so just marking worker as idle
    this.idleWorkers.add(workerInfo)
  }

  private doWork<T extends keyof WorkerModuleExports>(
    taskInfo: TaskInfo<T>,
    workerInfo: IWorkerInfo<T>
  ): void {
    // block worker
    workerInfo.currentTask = taskInfo
    this.idleWorkers.delete(workerInfo)

    const msg: ParentMessageUnion = [
      EXECUTE,
      taskInfo.functionName,
      taskInfo.args,
    ]
    workerInfo.worker.postMessage(msg)
  }

  private scheduleWork<T extends keyof WorkerModuleExports>(
    taskInfo: TaskInfo<T>
  ): Promise<unknown> {
    let workerToExecuteTaskNow:
      | IWorkerInfo<keyof WorkerModuleExports>
      | undefined

    if (taskInfo.assignedToWorker) {
      if (this.idleWorkers.has(taskInfo.assignedToWorker)) {
        workerToExecuteTaskNow = taskInfo.assignedToWorker
      }
    } else {
      workerToExecuteTaskNow = this.idleWorkers.values().next().value
    }

    if (workerToExecuteTaskNow) {
      this.doWork(taskInfo, workerToExecuteTaskNow)
    } else {
      this.taskQueue.push(taskInfo)
    }

    return taskInfo.promise
  }

  private scheduleWorkSingle<T extends keyof WorkerModuleExports>(
    functionName: T,
    ...args: Array<unknown>
  ): Promise<unknown> {
    return this.scheduleWork(new TaskInfo({ functionName, args }))
  }

  private scheduleWorkAll<T extends keyof WorkerModuleExports>(
    functionName: T,
    ...args: Array<unknown>
  ): Array<Promise<unknown>> {
    return this.workers.map(workerInfo =>
      this.scheduleWork(
        new TaskInfo({ assignedToWorker: workerInfo, functionName, args })
      )
    )
  }

  onMessage(listener: (msg: unknown, workerId: number) => void): void {
    this.listeners.push(listener)
  }

  sendMessage(msg: unknown, workerId: number): void {
    const worker = this.workers[workerId - 1]
    if (!worker) {
      throw new Error(`Well, we don't have worker like that :shrug:`)
    }

    const poolMsg = [CUSTOM_MESSAGE, msg]
    worker.worker.postMessage(poolMsg)
  }
}
