const localeProxyHandler = {
  get: (target, prop) => {
    if (prop in target[prop] && target.defaultLocale in target[prop]) {
      return target[prop][target.defaultLocale]
    }
    return target[prop]
  },
}

exports.localeProxyHandler = localeProxyHandler
