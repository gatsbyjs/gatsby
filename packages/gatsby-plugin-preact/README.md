# gatsby-plugin-preact

Provides drop-in support for replacing React with [Preact](https://preactjs.com/).

While Preact doesn't provide full support for the React ecosystem, it is an
intriguing option for Gatsby sites as it saves ~30kb of JavaScript vs. using
React.

> **Note:** This plugin uses Preact X, any version prior to `v10.0.0` is incompatible with Gatsby v2.

## Install

`npm install --save gatsby-plugin-preact preact`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-preact`]
```

## Usage in a development environment

Gatsby development server currently has a hardcoded dependency on `react-dom`, so this plugin does not enable Preact in development by default.

You can enable Preact in development by telling it to replace `react-hot-loader` with [`fast-refresh`](https://reactnative.dev/docs/next/fast-refresh) like so:

```shell
GATSBY_HOT_LOADER=fast-refresh gatsby develop
```

Note that Preact doesn't actually support `fast-refresh` so by switching, you loose hot reloading capabilities :(
