const preferDefault = m => (m && m.default) || m
exports.wrapRootComponent = preferDefault(require(`./inject-provider`))
