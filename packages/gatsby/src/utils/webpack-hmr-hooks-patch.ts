/* eslint-disable @typescript-eslint/ban-ts-ignore */

let originalFetch: any
// @ts-ignore
if (global.fetch) {
  // @ts-ignore
  originalFetch = global.fetch
  // @ts-ignore
  delete global.fetch
}

export { default } from "react-hot-loader/webpack"

// @ts-ignore
global.fetch = originalFetch
