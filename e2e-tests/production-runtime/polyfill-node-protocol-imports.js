// this polyfill adds support for "require('node:<node_builtin>')" imports
// this feature is available in Node v14.18.0+ and v16.0.0+
// gatsby's minimal version (v14.15.0) does not support this feature
// so the environment we run our e2e tests in doesn't support it
// and we need to use polyfill to test if our bundlers support it correctly

// this file is injected with NODE_OPTIONS env var via package.json's
// "build" script

try {
  require(`node:path`)
} catch (e) {
  const mod = require("module")
  const originalModuleLoad = mod._load
  mod._load = (request, parent, isMain) => {
    if (request.startsWith(`node:`)) {
      request = request.replace(`node:`, ``)
    }
    return originalModuleLoad(request, parent, isMain)
  }
}
