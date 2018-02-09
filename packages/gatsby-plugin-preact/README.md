# gatsby-plugin-preact

Provides drop-in support for replacing React with [Preact](https://preactjs.com/).

While Preact doesn't provide full support for the React ecosystem, it is an
intriguing option for Gatsby sites as it saves ~30kb of Javascript vs. using
React.

## Install

`npm install --save gatsby-plugin-preact preact preact-compat`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-preact`];
```
