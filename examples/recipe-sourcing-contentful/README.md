# Sourcing data from Contentful recipe example

This repo is a small example Gatsby site that shows how to source data from Contentful. You can [find the full recipe in the Gatsby docs](https://www.gatsbyjs.org/docs/recipes/#sourcing-data-from-contentful).

## Setting up your Contentful space

1. Install the [Contentful CLI](https://www.npmjs.com/package/contentful-cli)
2. Login to Contentful with the CLI, it will help you create an account if you don't have one

```
contentful login
```

3. Create a new space, this command will return a new space ID.

```
contentful space create --name 'Gatsby example'
```

4. Seed the new space with example blog content using the new space ID.

```
contentful space seed -s '[space ID]' -t blog
```

5. Create a new access token for your space.

```
contentful space accesstoken create -s '[space ID]' --name 'Example token'
```

6. Edit the file `gatsby-config.js` and add your space ID and access token to the following section:

```
plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `[space ID]`,
        accessToken: `[access token]`,
      },
    },
  ],
```

7. Run Gatsby.

```
gatsby develop
```
