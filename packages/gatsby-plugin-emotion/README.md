# gatsby-plugin-emotion

Provide support for using the css-in-js library
[Emotion](https://github.com/emotion-js/emotion) including server side
rendering.

## Install

```
npm install --save gatsby-plugin-emotion emotion emotion-server @emotion/core @emotion/styled
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
