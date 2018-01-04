const DEFAULT_LOCAL_IDENT_NAME = `[path]---[name]---[local]---[hash:base64:5]`

const LOCAL_IDENT_NAME = process.env.CSS_MODULES_LOCAL_IDENT_NAME || DEFAULT_LOCAL_IDENT_NAME

exports.LOCAL_IDENT_NAME = LOCAL_IDENT_NAME

exports.cssModulesConfig = stage => {
  const loader = `css?modules&minimize&importLoaders=1&localIdentName=${
    LOCAL_IDENT_NAME
  }`
  return stage.startsWith(`build`) ? loader : `${loader}&sourceMap`
}
