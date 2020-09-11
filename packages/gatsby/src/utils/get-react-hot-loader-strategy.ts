import semver from "semver"

// Fast refresh is supported as of React 16.9.
// This package will do some sniffing to see if the current version of
// React installed is greater than 16.0.
export function getReactHotLoaderStrategy(): string {
  // If the user has defined this, we don't want to do any package sniffing
  if (process.env.GATSBY_HOT_LOADER) return process.env.GATSBY_HOT_LOADER

  // Do some package sniffing to see if we can use fast-refresh if the user didn't
  // specify a specific hot loader with the environment variable.
  try {
    const reactVersion = require(`react/package.json`).version

    if (semver.satisfies(reactVersion, `>=16.9.0`)) {
      return `fast-refresh`
    }
  } catch (e) {
    return `react-hot-loader`
  }

  return `react-hot-loader`
}
