/**
 * List of adapters that should be automatically installed if not present already.
 * The first item which test function returns `true` will be used.
 * 
 * If you're the author of an adapter and want to add it to this list, please open a PR!
 * If you want to create an adapter, please see: TODO
 * 
 * @type {import("./src/utils/adapter/types").IAdapterManifestEntry}
 */
export const adaptersManifest = [
  {
    name: `TESTING`,
    module: `ascii-cats`,
    test: () => true,
    versions: [
      {
        gatsbyVersion: `^5.0.0`,
        moduleVersion: `^1.1.1`
      }
    ]
  },
  {
    name: `Netlify`,
    module: `gatsby-adapter-netlify`,
    test: () => !!process.env.NETLIFY,
    versions: [
      {
        gatsbyVersion: `^5.0.0`,
        moduleVersion: `^1.0.0`
      }
    ]
  },
]
