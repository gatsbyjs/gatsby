In order to take advantage of fast image processing in Gatsby, you need to **Query** your image using GraphQL. Under the hood, this query is processed using `gatsby-transformer-sharp`.

When querying for a specific image you use the `relativePath`. This path is relative to the path you configured for the `gatsby-source-filesystem` plugin and should ultimately point to your image file.

Inside the query you'll notice `fluid` and `GatsbyImageSharpFluid` query terms. There are other [types of image processing](/packages/gatsby-image/#two-types-of-responsive-images) you can prompt with your query which will alter both of those query terms.
