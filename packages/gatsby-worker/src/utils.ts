export const isPromise = (obj: any): obj is PromiseLike<unknown> =>
  !!obj &&
  (typeof obj === `object` || typeof obj === `function`) &&
  typeof obj.then === `function`
