# gatsby-plugin-nprogress

Automatically shows the [accessible-nprogress](https://github.com/nmackey/accessible-nprogress) indicator
when a page is delayed in loading (which Gatsby considers as one second after
clicking on a link).

## Install

```shell
npm install gatsby-plugin-nprogress
```

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-nprogress`,
    options: {
      // Setting a color is optional.
      color: `tomato`,
      // Disable the loading spinner.
      showSpinner: false,
    },
  },
]
```

You can pass in the custom configuration option `color` to [customize the accessible-nprogress CSS](https://github.com/nmackey/accessible-nprogress#customization). You may also pass all available [accessible-nprogress configuration options](https://github.com/nmackey/accessible-nprogress#configuration) into the plugin, too.
