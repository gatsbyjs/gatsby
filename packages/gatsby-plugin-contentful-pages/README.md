# gatsby-plugin-contentful-pages
A plugin for automatically creating pages from contentful content types. The Plugin requires the [gatsby-source-contentful](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-contentful) plugin to be installed and configured.

An example site for using this plugin is at https://using-contentful.gatsbyjs.org/

## Install

Installation via yarn or npm.

```
// npm
npm install --save gatsby-plugin-contentful-pages

// yarn
yarn add gatsby-plugin-contentful-pages
```

## Usage

The plugin can be configured as illustrated below.

```
// In your gatsby-config.js
plugins: [
  // Set up gatsby-source contentful
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id`,
      accessToken: `your_access_token`,
    },
  },
  // Configure the contentful-pages plugin
  {
    // Collection of content types for which you wish to create pages
    contentTypes: [
      {
        name: 'product',
        // The part of an `allContentful...` query containing the data
        // you want to query for (i.e., id, fields, etc.)
        subQuery: `
          id
          name
          description {
            description
          }
          price
        `,
        // Path to the template component for the content type.
        component: './src/path/to/page-template/component',
        // Path the created page should have no your site.
        // Can be a string or function.
        path: ({ id, ...fields }) => `/${fields.name}`,
      },
      {
        name: 'page',
        subQuery: `
          id,
          name
          slug
          title
          body {
            body
          }
        `,
        // Now we are using a function to determine the component. Useful
        // When you have a content type Page and each page requires
        // a different template. Here, we determine the template by the
        // name field.
        component: ({ name }) => `.src/page-components/${name}`,
        path: ({ id, ...fields }) => `/${fields.slug}`
      }
    ]
  }
];
```

### Dynamic component and page paths

Both the `component` and `path` properties of a content type configuration in the plugin's options can be either a string or a function. When specifying a function, your function will be called an object containing all the properties you specified in the content type's `subQuery` setting. The plugin takes care of cleaning up the typical gatsby GraphQL data structure

```
allContentfulProduct: {
  edges: [
    //...
    {
      id,
      field1,
      field2,
      //...
    },
    // ...
  ],
}
```

and returns only the Contentful entry's properties you specified from `subQuery`.