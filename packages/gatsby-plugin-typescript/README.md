# gatsby-plugin-typescript
Provides drop-in support for TypeScript and TSX.

## Install
`yarn add gatsby-plugin-typescript`

## How to use
1. Include the plugin in your `gatsby-config.js` file.
2. Write your components in TSX or TypeScript.
3. You're good to go.

```javascript
// in gatsby-config.js
plugins: [
  // no configuration
  `gatsby-plugin-typescript`,
  // custom configuration
  {
    resolve: `gatsby-plugin-typescript`,
    options: {
      // compilerOptions are passed directly to the compiler
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`
      }
    }
  }
]
```