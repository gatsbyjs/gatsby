---
title: Troubleshooting Common Errors
---

Let's solve some errors

(using styled components without installing the other libraries)

(using styled components without adding the plugin to the config)

## Field "image" must not have a selection since type "String" has no subfields

This errror message `Field "image" must not have a selection since type "String" has no subfields.` comes up when a GraphQL query is trying to query a field for subfields, but none exist. This generally happens when plugins that are used together are added in the `gatsby-config` in the wrong order, or haven't been added at all.

The query is trying to access fields that don't exist because they weren't set up at build time. In the following code, a query is looking to find the subfield `childImageSharp` of the `image` field, like the error states.

```graphql
allMdx {
  nodes {
    id
    title
    image {
      childImageSharp {
        fluid {
          srcSet
        }
      }
    }
  }
}
```

However, the schema for the query in actuality looks more like this:

```graphql
allMdx {
  nodes {
    id
    title
    image
  }
}
```

The `image` field was not modified by a plugin to add subfields, so it would only return a string. `gatsby-plugin-sharp` and `gatsby-transformer-sharp` can be included before other plugins that would manipulate or create image nodes (like `gatsby-source-filesystem` or `gatsby-source-contentful`) to ensure that they are present before Gatsby tries to modify them and add the needed fields.

Another possibility is that empty strings are used for image paths somewhere in your site, and when Gatsby constructs a GraphQL schema it infers the wrong type because the empty string doesn't look like a path.

## Errors installing `sharp` with `gatsby-plugin-sharp`

If you see an error message in the console when installing dependencies that look related to sharp like `gyp ERR! build error` and `npm ERR! Failed at the sharp@x.x.x install script`, then can generally be resolved by deleting the `node_nodules` folder in the root of your project and installing dependencies again:

```shell
# be careful as this command will delete all files recursively in
# the folder you provide, in this case, node_modules
rm -rf node_modules

# this command will install libraries from your package.json file
# and place them in the node_modules folder
npm install
```

The version of Node.js that's used to install sharp needs to match the versioin of Node.js that is run, so clearing `node_modules` and reinstalling often resolves the problem.

(using a variable in a static query)

(capitalization of files in builds: https://app.netlify.com/sites/kylegill/deploys/5bddea04e39e7c7941e0041d)
