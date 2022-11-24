import { createErrorFromString } from "../errors"

const errorStr = `./src/pages/index.module.scss\nModule build failed: /project/src/data/assets/conference.jpg:1\n(function (exports, require, module, __filename, __dirname) { ����\n                                                              ^\n\nSyntaxError: Invalid or unexpected token\n    at new Script (vm.js:74:7)\n    at NativeCompileCache._moduleCompile (/project/node_modules/v8-compile-cache/v8-compile-cache.js:226:18)\n    at Module._compile (/project/node_modules/v8-compile-cache/v8-compile-cache.js:172:36)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:689:10)\n    at Module.load (internal/modules/cjs/loader.js:589:32)\n    at tryModuleLoad (internal/modules/cjs/loader.js:528:12)\n    at Function.Module._load (internal/modules/cjs/loader.js:520:3)\n    at Module.require (internal/modules/cjs/loader.js:626:17)\n    at require (/project/node_modules/v8-compile-cache/v8-compile-cache.js:159:20)\n    at Object.<anonymous> (/project/src/pages/index.module.scss:7:231)\n    at Module._compile (/project/node_modules/v8-compile-cache/v8-compile-cache.js:178:30)\n    at Object.module.exports (/project/node_modules/gatsby/dist/utils/webpack-extract-css-modules-map.js:16:5)\n @ ./src/pages/index.jsx 6:0-41 9:13-19 13:13-19\n @ ./.cache/sync-requires.js\n @ ./.cache/static-entry.js`

// TODO: Add tests for sourcemap mapping in prepareStackTrace[]

describe(`createErrorFromString`, () => {
  it(`converts a string to an Error object`, () => {
    const err = createErrorFromString(errorStr, ``)
    expect(typeof err).toEqual(`object`)
    expect(err.name).toEqual(`WebpackError`)
    expect(err.message).toEqual(`./src/pages/index.module.scss`)
  })
})
