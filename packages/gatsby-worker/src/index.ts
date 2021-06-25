import { fork, ChildProcess } from "child_process"

import { TaskQueue } from "./task-queue"
import {
  EXECUTE,
  END,
  ERROR,
  RESULT,
  ParentMessageUnion,
  ChildMessageUnion,
} from "./types"

interface IWorkerOptions {
  numWorkers?: number
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
  worker: ChildProcess
  exitedPromise: Promise<{
    code: number | null
    signal: NodeJS.Signals | null
  }>
  currentTask?: TaskInfo<T>
}

export class WorkerPool<WorkerModuleExports = Record<string, unknown>> {
  /**
   * Schedule task execution on all workers. Useful for setting up workers
   */
  all: {
    [FunctionName in keyof WorkerModuleExports]: WrapReturnInArray<
      EnsureFunctionReturnsAPromise<WorkerModuleExports[FunctionName]>
    >
  }

  /**
   * Schedule task execution on single worker. Useful to distribute tasks between multiple workers.
   */
  single: {
    [FunctionName in keyof WorkerModuleExports]: EnsureFunctionReturnsAPromise<
      WorkerModuleExports[FunctionName]
    >
  }

  private workers: Array<IWorkerInfo<keyof WorkerModuleExports>> = []
  private taskQueue = new TaskQueue<TaskInfo<keyof WorkerModuleExports>>()
  private idleWorkers: Set<IWorkerInfo<keyof WorkerModuleExports>> = new Set()

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
      const worker = fork(childWrapperPath, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ...(options?.env ?? {}),
          GATSBY_WORKER_ID: workerId.toString(),
          GATSBY_WORKER_MODULE_PATH: workerPath,
        },
      })

      const workerInfo: IWorkerInfo<keyof WorkerModuleExports> = {
        workerId,
        worker,
        exitedPromise: new Promise(resolve => {
          worker.on(`exit`, (code, signal) => {
            if (workerInfo.currentTask) {
              // worker exited without finishing a task
              workerInfo.currentTask.reject(
                new Error(`Worker exited before finishing task`)
              )
            }
            // remove worker from list of workers
            this.workers.splice(this.workers.indexOf(workerInfo), 1)
            // console.log(`after exit`, this.workers)
            resolve({ code, signal })
          })
        }),
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
        }
      })

      this.workers.push(workerInfo)
      this.idleWorkers.add(workerInfo)
    }
  }

  end(): Array<Promise<number | null>> {
    const results = this.workers.map(async workerInfo => {
      // tell worker to end gracefully
      const endMessage: ParentMessageUnion = [END]

      workerInfo.worker.send(endMessage)

      // force exit if worker doesn't exit gracefully quickly
      const forceExitTimeout = setTimeout(() => {
        workerInfo.worker.kill(`SIGKILL`)
      }, 1000)

      const exitResult = await workerInfo.exitedPromise

      clearTimeout(forceExitTimeout)

      return exitResult.code
    })

    Promise.all(results).then(() => {
      // make sure we fail queued tasks as well
      for (const taskNode of this.taskQueue) {
        taskNode.value.reject(new Error(`Worker exited before finishing task`))
      }
    })

    return results
  }

  private checkForWork<T extends keyof WorkerModuleExports>(
    workerInfo: IWorkerInfo<T>
  ): void {
    // check if there is task in queue
    for (const taskNode of this.taskQueue) {
      const task = taskNode.value
      if (!task.assignedToWorker || task.assignedToWorker === workerInfo) {
        this.doWork(task, workerInfo)
        this.taskQueue.remove(taskNode)

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
    workerInfo.worker.send(msg)
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
      this.taskQueue.enqueue(taskInfo)
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
}
