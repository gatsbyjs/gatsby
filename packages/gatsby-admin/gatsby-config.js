module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-react-helmet",
      options: {},
    },
    {
      resolve: "gatsby-plugin-webfonts",
      options: {
        fonts: {
          google: [
            {
              family: `Inter`,
              variants: [`400`, `600`, `800`],
            },
          ],
        },
      },
    },
    {
      resolve: "gatsby-plugin-create-client-paths",
      options: {
        prefixes: ["/plugins/*"],
      },
    },
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "tests",
      },
    },
  ],
  pathPrefix: `/___admin`,
}
