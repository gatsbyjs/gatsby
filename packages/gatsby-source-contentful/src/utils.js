// When iterating on tons of objects, we don't want to block the event loop
// this helper function returns a promise that resolves on the next tick so that the event loop can continue before we continue running blocking code
export function untilNextEventLoopTick() {
  return new Promise(res => {
    setImmediate(() => {
      res(null)
    })
  })
}
