import type Worker from "jest-worker"

type WrapReturnOfAFunctionInAPromise<
  FunctionThatDoesNotReturnAPromise extends (...args: Array<any>) => any
> = (
  ...a: Parameters<FunctionThatDoesNotReturnAPromise>
) => Promise<ReturnType<FunctionThatDoesNotReturnAPromise>>

// jest-worker will make sync function async, so to keep proper types we need to adjust types so all functions
// on worker pool are async
type EnsureFunctionReturnsAPromise<MaybeFunction> = MaybeFunction extends (
  ...args: Array<any>
) => Promise<any>
  ? MaybeFunction
  : MaybeFunction extends (...args: Array<any>) => any
  ? WrapReturnOfAFunctionInAPromise<MaybeFunction>
  : never

export type CreateWorkerPoolType<ExposedFunctions> = Worker &
  {
    [FunctionName in keyof ExposedFunctions]: EnsureFunctionReturnsAPromise<
      ExposedFunctions[FunctionName]
    >
  }
