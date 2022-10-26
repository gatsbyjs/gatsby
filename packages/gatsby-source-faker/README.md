# gatsby-source-faker

This is a plugin that allows you to use [faker.js](https://github.com/marak/Faker.js/) to generate fake data for Gatsby sites. This could come in handy for creating example sites, documentation, or just to experiment with Gatsby.

## Installation

```shell
npm install gatsby-source-faker
```

## How to use it

Add `gatsby-source-faker` to the `gatsby-config.js` as following:

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-faker`,
      // derive schema from faker's options
      options: {
        schema: {
          name: ["firstName", "lastName"],
        },
        count: 3, // how many fake objects you need
        type: "NameData", // Name of the graphql query node
      },
    },
  ],
}
```

Example: [Using Faker](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-faker)
