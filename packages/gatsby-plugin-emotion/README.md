# gatsby-plugin-emotion

Provide support for using the css-in-js library
[Emotion](https://github.com/emotion-js/emotion) including server side
rendering.

**This plugin supports Emotion v10+**

Older versions should use versions of this plugin which support Emotion 8 and 9. Check out the Emotion 10 [migration
guide](https://emotion.sh/docs/migrating-to-emotion-10#incremental-migration) for more information on how to upgrade.

## Install

```
npm install --save gatsby-plugin-emotion @emotion/core @emotion/styled
```

## How to use

Add the plugin to your `gatsby-config.js`.

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-emotion`,
      options: {
        // Accepts all options defined by `babel-plugin-emotion` plugin.
      },
    },
  ],
}
```
