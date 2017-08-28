export function isProduction() {
  return process.env.NODE_ENV === `production`
}

export function getLocalIdentName() {
  return isProduction()
    ? `[hash:base64]` // Webpack default if unspecified
    : `[path]---[name]---[local]---[hash:base64:5]`
}

export default function cssModulesConfig(stage) {
  const loader = `css?modules&minimize&importLoaders=1`

  return stage.startsWith(`build`)
    ? loader
    : `${loader}&sourceMap&localIdentName=${getLocalIdentName()}`
}
