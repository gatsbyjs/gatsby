/* eslint-disable @babel/no-invalid-this */
let resolve = null
let awaitingAPI = null

export function waitForAPI(api) {
  const promise = new Promise(r => {
    resolve = r
  })
  awaitingAPI = api

  if (this.___resolvedAPIs && this.___resolvedAPIs.includes(api)) {
    // If the API has been marked as pre-resolved,
    // resolve immediately and reset the variables.
    awaitingAPI = null
    this.___resolvedAPIs = []
    resolve()
  }
  return promise
}

export default function apiHandler(api) {
  if (!awaitingAPI) {
    // If we're not currently waiting for anything,
    // mark the API as pre-resolved.
    this.___resolvedAPIs.push(api)
  } else if (api === awaitingAPI) {
    // If we've been waiting for something, now it's time to resolve it.
    awaitingAPI = null
    this.___resolvedAPIs = []
    resolve()
  }
}
