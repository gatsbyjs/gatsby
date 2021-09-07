// This module should be imported as first or one first modules in engines.
// It allows to provide alternative `fs` module by setting `global._fsWrapper`
// variable before importing engine. It will automatically fallback to regular
// `fs` if alternative `fs` is not provided.

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Global {
      _fsWrapper: typeof import("fs")
      _actualFsWrapper: typeof import("fs")
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __non_webpack_require__: typeof require

if (global._fsWrapper) {
  global._actualFsWrapper = global._fsWrapper
} else {
  // fs alternative not provided - falling back to regular fs
  global._actualFsWrapper = __non_webpack_require__(`fs`)
}

// hydrate webpack module cache (consume global, so it's not lazy)
require(`fs`)

// https://stackoverflow.com/a/59499895
export {}
