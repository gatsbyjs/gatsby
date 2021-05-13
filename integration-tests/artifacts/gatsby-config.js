module.exports = {
  siteMetadata: {
    title: `Hello world`,
    author: `Sid Chatterjee`,
    twitter: `chatsidhartha`,
    github: `sidharthachatterjee`,
    moreInfo: `Sid is amazing`,
  },
  flags: {
    PRESERVE_WEBPACK_CACHE: true,
  },
  plugins: [`gatsby-plugin-webpack-1`, `gatsby-plugin-webpack-2`],
}
