let resolve, promise
const resetRouteChangePromise = () => {
  promise = new Promise(r => {
    resolve = r
  })
}
resetRouteChangePromise()
const waitForRouteChange = () => promise

const resolveRouteChangePromise = () => {
  resolve(window.location)
}

// We need to set this function on the window
// so it's accessible to Cypress for tests.
if (typeof window !== `undefined`) {
  window.___waitForRouteChange = waitForRouteChange
}

export {
  waitForRouteChange,
  resolveRouteChangePromise,
  resetRouteChangePromise,
}
