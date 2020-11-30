// import semver from "semver"

// Fast refresh is supported as of React 16.9.
// This package will do some sniffing to see if the current version of
// React installed is greater than 17.0.
export function getReactHotLoaderStrategy(): string {
  // If the user has defined this, we don't want to do any package sniffing
  if (process.env.GATSBY_HOT_LOADER) return process.env.GATSBY_HOT_LOADER

  // Do some package sniffing to see if we can use fast-refresh if the user didn't
  // specify a specific hot loader with the environment variable.

  // TODO: Decide if we wanna do this
  /*
  try {
    const reactVersion = require(`react/package.json`).version

    // TODO React components need to be named to make fast-refresh work
    // We need to create an eslint-rule that shows this error or create a babel plugin
    // that converts arrow functions to generated named ones.
    // When it's available we can switch the condition to >=16.9.0
    if (semver.satisfies(reactVersion, `>=17.0.0`)) {
      return `fast-refresh`
    }
  } catch (e) {
    return `react-hot-loader`
  }
  */

  return `react-hot-loader`
}
