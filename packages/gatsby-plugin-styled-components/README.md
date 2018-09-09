# gatsby-plugin-styled-components

A [Gatsby](https://github.com/gatsbyjs/gatsby) plugin for
[styled-components](https://github.com/styled-components/styled-components) with
built-in server-side rendering support.

## Install

`npm install --save gatsby-plugin-styled-components styled-components babel-plugin-styled-components`

Then add it to your babel configuration like so:

```javascript
{
  "plugins": ["babel-plugin-styled-components"]
}
```

Note: The plugin call order in your `.babelrc` file matters. If you're using the env property in your babel configuration, then putting this plugin into the plugins array won't suffice. Instead it needs to be put into each env's plugins array to maintain it being executed first. See [this](https://github.com/styled-components/babel-plugin-styled-components/issues/78) for more information.

## How to use

Edit `gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        // Add any options here
      },
    },
  ],
}
```

# Options

You can pass options to the plugin, see the [Styled Components docs](https://www.styled-components.com/docs/tooling#babel-plugin) for a full list of options.

For example, to disable the `displayName` option:

```js
options: {
  displayName: false
}
```

Note: The `ssr` option will be ignored. Gatsby will apply it automatically when needed.

### Breaking changes history

<!-- Please keep the breaking changes list ordered with the newest change at the top -->

#### v3.0.0

support Gatsby v2 only

#### v2.0.1

`styled-components` is moved to a peer dependency. Installing the package
alongside `gatsby-plugin-styled-components` is now required. Use `npm install --save styled-components`
