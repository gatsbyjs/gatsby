# Limit nodes during development

For very large sites it may take quite a while to start `gatsby develop` when you start working on a project. To mitigate this annoyance, we've added a plugin option to limit the number of nodes that will be pulled on any type.

Lets say you have 1000 or even 10,000 posts. You can do the following to only fetch the latest 50!

gatsby-config.js:

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: process.env.WPGRAPHQL_URL,
        type: {
          Post: {
            limit:
              process.env.NODE_ENV === `development`
                ? // Lets just pull 50 posts in development to make it easy on ourselves.
                  50
                : // And all posts in production
                  null,
          },
        },
      },
    },
  ],
}
```

Now when you run `gatsby develop` you can start working in 20 seconds instead of 20 minutes!

:point_left: [Back to Features](./index.md)
