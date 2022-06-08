module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        root: `mocked`,
        extensions: [`mocked`],
        mediaTypes: [`mocked`],
        shouldBlockNodeFromTransformation: true,
        commonmark: true,
        lessBabel: true,
        remarkPlugins: [[() => { }, { foo: `some_plugin` }]],
        rehypePlugins: [`some_plugin`],
        gatsbyRemarkPlugins: [`gatsby-remark-something`]
      }
    }
  ]
}