import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `using-gatsby-script`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: [],
  /**
   * Add the CDN URL for the `marked` module to the Partytown proxy allowlist
   * so we can load it with the `off-main-thread` strategy.
   *
   * This is required, otherwise the request will 404.
   */
  partytownProxiedURLs: [`https://cdn.jsdelivr.net/npm/marked/marked.min.js`],
}

export default config
