module.exports = {
  plugins: [{
    resolve: "gatsby-plugin-react-helmet"
  }, {
    resolve: "gatsby-plugin-webfonts",
    options: {
      fonts: {
        google: [{
          family: `Inter`,
          variants: [`400`, `600`, `800`]
        }]
      }
    }
  }],
  pathPrefix: `/___admin`
};