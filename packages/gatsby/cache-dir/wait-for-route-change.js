let promiseResolvers = []

const addListener = () =>
  new Promise(resolve => {
    promiseResolvers.push(resolve)
  })

const resolveRouteChangeListeners = () => {
  promiseResolvers.forEach(r => r(window.location))
  promiseResolvers = []
}

// We need to set this function on the window
// so it's accessible to Cypress for tests.
if (typeof window !== `undefined`) {
  window.___waitForRouteChange = addListener
}

export { addListener, resolveRouteChangeListeners }
