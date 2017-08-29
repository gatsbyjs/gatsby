export const LOCAL_IDENT_NAME = `[path]---[name]---[local]---[hash:base64:5]`

export default function cssModulesConfig(stage) {
  const loader = `css?modules&minimize&importLoaders=1&localIdentName=${LOCAL_IDENT_NAME}`
  return stage.startsWith(`build`) ? loader : `${loader}&sourceMap`
}
