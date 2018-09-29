let resolve = null
let promise = null
let awaitingAPI = null
let resolvedAPIs = []

export function waitForAPI(api) {
  promise = new Promise(r => {
    resolve = r
  })
  awaitingAPI = api

  if (resolvedAPIs.indexOf(api) !== -1) {
    // If the API has been marked as pre-resolved,
    // resolve immediately and reset the variables.
    resolve()
    awaitingAPI = null
    resolvedAPIs = []
  }
  return promise
}

export function resolveAPIPromise(api) {
  if (!awaitingAPI) {
    // If we're not currently waiting for anything,
    // mark the API as pre-resolved.
    resolvedAPIs.push(api)
  } else if (api === awaitingAPI) {
    // If we've been waiting for something, now it's time to resolve it.
    awaitingAPI = null
    resolvedAPIs = []
    resolve()
  }
}
