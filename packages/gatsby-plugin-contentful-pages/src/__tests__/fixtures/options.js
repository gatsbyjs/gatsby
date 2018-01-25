module.exports = {
  contentTypes: [
    {
      name: `Product`,
      subQuery: `
        id
        slug
        tags
        price
        quantity
      `,
      path: ({ slug }) => `/${slug}`,
      component: `path/to/component`
    },
  ],
}
