/* eslint-disable @typescript-eslint/ban-ts-ignore */

// @ts-ignore: This file assume run at browsers.
const originalFetch = global.fetch
// @ts-ignore
delete global.fetch

export { default } from "react-hot-loader/webpack"

// @ts-ignore
global.fetch = originalFetch
