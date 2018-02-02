# gatsby-plugin-less

Adds the ability to load and parse Less-flavored CSS.

## Install

`npm install --save gatsby-plugin-less`

## How to use

Add the plugin to your `gatsby-config.js`.

```javascript
plugins: [`gatsby-plugin-less`];
```

By default this plugin will compile `*.less` and `*.module.less` files. The plugin can also be used with `modifyVars` as it is explained [here](http://lesscss.org/usage/). By defining a javascript object you can overwrite less-variables. This can be useful when using a component library like [antd](https://ant.design/docs/react/introduce).

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      theme: {
        "text-color": `#fff`,
      },
    },
  },
];
```

Or you can specify a file which exports a object in the same form.

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      theme: `./src/theme.js`,
    },
  },
];
```

In file `./src/theme.js`:

```javascript
module.exports = {
  "text-color": `#fff`,
};
```
