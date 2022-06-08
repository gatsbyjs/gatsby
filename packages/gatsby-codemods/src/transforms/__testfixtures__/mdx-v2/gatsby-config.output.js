module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        gatsbyRemarkPlugins: [`gatsby-remark-something`],

        mdxOptions: {
          remarkPlugins: [[() => { }, { foo: `some_plugin` }]],
          rehypePlugins: [`some_plugin`]
        }
      }
    }
  ]
}