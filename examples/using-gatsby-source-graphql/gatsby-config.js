module.exports = {
  plugins: [
    `gatsby-plugin-netlify`,
    {
      resolve: `gatsby-source-graphql`,
      options: {
        fieldName: `cms`,
        url: `https://api-euwest.graphcms.com/v1/cjjr1at6d0xb801c3scjrm0l0/master`,
        typeName: `GraphCMS`,
        refetchInterval: 60,
      },
    },
  ],
}
