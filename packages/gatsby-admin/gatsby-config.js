module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-react-helmet",
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
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".md", ".mdx"],
      },
    },
  ],
  pathPrefix: `/___admin`,
}
