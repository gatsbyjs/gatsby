module.exports = {
  plugins: [
    "gatsby-plugin-react-helmet",
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
  ],
  pathPrefix: `/___admin`,
}
