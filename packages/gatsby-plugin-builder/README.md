# gatsby-plugin-builder

Plugin for integrating [Builder.io](https://www.builder.io) with Gatsby. It puts the Builder.io schema under an `allBuilderModels` field of the Gatsby GraphQL query, If a templates map is passed as option, this plugin will create gatsby pages dynamically for each page entry in builder.io on the path specified.

## Install

`npm install --save gatsby-plugin-builder`

## How to use

```javascript
// In your gatsby-config.js
const path = require('path')
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-builder",
      options: {
        // public API Key
        publicAPIKey: "MY_PUBLIC_API_KEY",
        templates: {
          myPageModel: path.resolve('templates/my-page.tsx')
        }
      },
    },
  ]
}
```

## How to Query
For an up-to-date complete examples check out the examples on [BuilderIo/SDK](https://github.com/BuilderIO/builder/tree/master/examples)

```graphql
{
  allBuilderModels {
    myPageModel {
      everything
    }
  }
}
```
