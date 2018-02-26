## gatsby-source-faker

This is a plugin that allows you to use [faker.js](https://github.com/marak/Faker.js/) to generate fake data for gatsby sites. This could come in handy for creating example sites, documentation, or just to experiment with Gatsby.js

### To use it

Install `gatsby-source-faker`

```
    yarn add gatsby-source-faker
```

or

```
    npm install gatsby-source-faker
```

Add `gatsby-source-faker` to the `gatsby-config.js` as follows

```javascript
plugins: [
  {
    resolve: `gatsby-source-faker`,
    // derive schema from faker's options
    options: {
      schema: {
        name: ["firstName", "lastName"],
        count: 3, // how many fake objects you need
        type: "NameData", // Name of the graphql query node
      },
    },
  },
];
```
