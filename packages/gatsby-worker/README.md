# gatsby-worker

Utility to execute tasks in forked processes. Highly inspired by [`jest-worker`](https://www.npmjs.com/package/jest-worker).

## Example

File `worker.ts`:

```ts
export async function heavyTask(param: string): Promise<string> {
  // using workers is ideal for CPU intensive tasks
  return await heavyProcessing(param)
}

export async function setupStep(param: string): Promise<void> {
  await heavySetup(param)
}
```

File `parent.ts`

```ts
import { WorkerPool } from "gatsby-worker"

const workerPool = new WorkerPool<typeof import("./worker")>(
  require.resolve(`./worker`),
  {
    numWorkers: 5,
    env: {
      CUSTOM_ENV_VAR_TO_SET_IN_WORKER: `foo`,
    },
  }
)

// queue a task on all workers
const arrayOfPromises = workerPool.all.setupStep(`bar`)

// queue a task on single worker
const singlePromise = workerPool.single.heavyTask(`baz`)
```

## API

### Constructor

```ts
// TypeOfWorkerModule allows to type exposed functions ensuring type safety.
// It will convert sync methods to async and discard/disallow usage of exports
// that are not functions. Recommended to use with `<typeof import("path_to_worker_module")>`.
const workerPool = new WorkerPool<TypeOfWorkerModule>(
  // Absolute path to worker module. Recommended to use with `require.resolve`
  workerPath: string,
  // Not required options
  options?: {
    // Number of workers to spawn. Defaults to `1` if not defined.
    numWorkers?: number
    // Additional env vars to set in worker. Worker will inherit env vars of parent process
    // as well as additional `GATSBY_WORKER_ID` env var (starting with "1" for first worker)
    env?: Record<string, string>
  }
)
```

### `.single`

```ts
// Exports of the worker module become available under `.single` property of `WorkerPool` instance.
// Calling those will either start executing immediately if there are any idle workers or queue them
// to be executed once a worker become idle.
const singlePromise = workerPool.single.heavyTask(`baz`)
```

### `.all`

```ts
// Exports of the worker module become available under `.all` property of `WorkerPool` instance.
// Calling those will ensure a function is executed on all workers. Best usage for this is performing
// setup/bootstrap of workers.
const arrayOfPromises = workerPool.all.setupStep(`baz`)
```

### `.end`

```ts
// Used to shutdown `WorkerPool`. If there are any in progress or queued tasks, promises for those will be rejected as they won't be able to complete.
const arrayOfPromises = workerPool.end()
```

### `isWorker`

```ts
// Determine if current context is executed in worker context. Useful for conditional handling depending on context.
import { isWorker } from "gatsby-worker"

if (isWorker) {
  // this is executed in worker context
} else {
  // this is NOT executed in worker context
}
```

## Usage with unit tests

If you are working with source files that need transpilation, you will need to make it possible to load untranspiled modules in child processes.
This can be done with `@babel/register` (or similar depending on your build toolchain). Example setup:

```ts
const testWorkerPool = new WorkerPool<WorkerModuleType>(workerModule, {
  numWorkers,
  env: {
    NODE_OPTIONS: `--require ${require.resolve(`./ts-register`)}`,
  },
})
```

This will execute additional module before allowing adding runtime support for new JavaScript syntax or support for TypeScript. Example `ts-register.js`:

```js
// spawned process won't use jest config (or other testing framework equivalent) to support TS, so we need to add support ourselves
require(`@babel/register`)({
  extensions: [`.js`, `.ts`],
  configFile: require.resolve(relativePathToYourBabelConfig),
  ignore: [/node_modules/],
})
```
