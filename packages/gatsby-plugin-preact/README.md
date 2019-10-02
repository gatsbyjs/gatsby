# gatsby-plugin-preact

Provides drop-in support for replacing React with [Preact](https://preactjs.com/).

While Preact doesn't provide full support for the React ecosystem, it is an
intriguing option for Gatsby sites as it saves ~30kb of JavaScript vs. using
React.

> **Note:** This plugin uses Preact X, which is currently in beta, since Preact 8 is incompatible with Gatsby v2

## Install

`npm install --save gatsby-plugin-preact preact@next`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-preact`]
```

## Usage in a development environment

Gatsby development server currently has a hardcoded dependency on React-dom, therefore this plugin does not enable Preact in development.

While Preact is designed to be a drop-in replacement, you should check that your production build works as expected before putting it live.
