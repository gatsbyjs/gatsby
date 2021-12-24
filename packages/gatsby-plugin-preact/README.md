# gatsby-plugin-preact

Provides drop-in support for replacing React with [Preact](https://preactjs.com/).

While Preact doesn't provide full support for the React ecosystem, it is an
intriguing option for Gatsby sites as it saves ~30kb of JavaScript vs. using
React.

> **Note:** This plugin uses Preact X, any version prior to `v10.0.0` is incompatible with Gatsby v2.

## Install

`npm install gatsby-plugin-preact preact preact-render-to-string@5.1.6`

**Important:** please don't use latest preact-render-to-string until issue[#34263](https://github.com/gatsbyjs/gatsby/issues/34263) be fixed!

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-preact`]
```
