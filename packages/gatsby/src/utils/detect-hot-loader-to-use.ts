import semver from "semver"

// Fast refresh is supported as of React 16.8.
// This package will do some sniffing to see if the current version of
// React installed is greater than 16.8.
export function detectHotLoaderToUse(): void {
  // If the user has defined this, we don't want to do any package sniffing
  if (process.env.GATSBY_HOT_LOADER) return

  // Do some package sniffing to see if we can use fast-refresh if the user didn't
  // specify a specific hot loader with the environment variable.
  try {
    const reactVersion = require(`react/package.json`).version
    const parsed = semver.parse(reactVersion)

    if (
      parsed &&
      // React 17+ is supported
      (parsed.major >= 17 ||
        // React 16.8+ is supported
        (parsed.major === 16 && parsed.minor >= 8))
    ) {
      process.env.GATSBY_HOT_LOADER = `fast-refresh`
    }
  } catch (e) {
    process.env.GATSBY_HOT_LOADER = `react-hot-loader`
  }

  if (!process.env.GATSBY_HOT_LOADER)
    process.env.GATSBY_HOT_LOADER = `react-hot-loader`

  console.log(`HOTLOADER:`, process.env.GATSBY_HOT_LOADER)
}
