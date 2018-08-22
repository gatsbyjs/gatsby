# gatsby-plugin-netlify-functions

Netlify Functions allow you to run AWS Lambda functions.

For more details, check out the [docs
site](https://www.netlify.com/docs/functions/).

## Install

```shell
npm install --save gatsby-plugin-netlify-functions
```

## How to use

Add the Netlify Functions plugin in your `gatsby-config.js`:

```javascript
plugins: [`gatsby-plugin-netlify-functions`]
```

## Options

Netlify Functions can be configured via the plugin options below. You can learn
about how to pass options to plugins in the [Gatsby
docs](https://www.gatsbyjs.org/docs/plugins/#how-to-use-gatsby-plugins).

### `functionsSrc`

(_required_, default: `undefined`)

Directory of the source of functions

### `functionsOutput`

(_required_, default: `undefined`)

Directory where to put builded functions

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-netlify-functions`,
    options: {
      functionsSrc: `${__dirname}/src/functions`,
      functionsOutput: `${__dirname}/functions`,
    },
  },
]
```


## Support

For help with integrating Netlify Functions with Gatsby, check out the community
[Gitter](https://gitter.im/netlify/lambda-functions).
