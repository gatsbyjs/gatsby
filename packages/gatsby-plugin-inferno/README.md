# gatsby-plugin-inferno

Provides drop-in support for replacing React with [Inferno](https://infernojs.org/).

While Inferno doesn't provide full support for the React ecosystem, it is an
intriguing option for Gatsby sites as it both offers bundle size and performance benefits over React

## Install

`npm install --save gatsby-plugin-preact inferno inferno-compat`

More information can be found on [inferno-compat's README](https://github.com/infernojs/inferno/tree/master/packages/inferno-compat). They allow you to customize what React features you support via additional packages

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-inferno`]
```
