// `gatsby-confi.tsx` name is intentional. This is used for testing misspelled `gatsby-config` errors

import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `ts`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: [],
}

export default config
