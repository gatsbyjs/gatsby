exports.LOCAL_IDENT_NAME = `[path]---[name]---[local]---[hash:base64:5]`

exports.cssModulesConfig = stage => {
  const loader = `css?modules&minimize&importLoaders=1&localIdentName=${LOCAL_IDENT_NAME}`
  return stage.startsWith(`build`) ? loader : `${loader}&sourceMap`
}
