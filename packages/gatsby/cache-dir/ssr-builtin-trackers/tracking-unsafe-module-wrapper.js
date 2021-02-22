// initializing global here for unsafe builtin usage at import time
global.unsafeBuiltinUsage = []

function createProxyHandler(prefix) {
  return {
    get: function (target, key) {
      const value = target[key]
      if (typeof value === `function`) {
        return function wrapper(...args) {
          const myErrorHolder = {
            name: `Unsafe builtin usage ${prefix}.${key}`,
          }
          Error.captureStackTrace(myErrorHolder, wrapper)

          global.unsafeBuiltinUsage.push(myErrorHolder.stack)
          return value.apply(target, args)
        }
      } else if (typeof value === `object` && value !== null) {
        return new Proxy(
          value,
          createProxyHandler(
            key && key.toString ? `${prefix}.${key.toString()}` : prefix
          )
        )
      }

      return value
    },
  }
}

function wrapModuleWithTracking(moduleName) {
  const mod = require(moduleName)
  return new Proxy(mod, createProxyHandler(moduleName))
}

exports.wrapModuleWithTracking = wrapModuleWithTracking
