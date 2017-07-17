# gatsby-plugin-typescript
Provides drop-in support for TypeScript and TSX.

## Install
`yarn add gatsby-plugin-typescript typescript`

## How to use
1. Include the plugin in your `gatsby-config.js` file.
1. Add `tsconfig.json` file on your root directory.
1. Write your components in TSX or TypeScript.
1. You're good to go.

`gatsby-config.js`
```javascript
plugins: [
  `gatsby-plugin-typescript`,
]
```

`tsconfig.json`
```json
{
    "compilerOptions": {
        "outDir": "./dist/",
        "sourceMap": true,
        "noImplicitAny": true,
        "module": "commonjs",
        "target": "esnext",
        "jsx": "react",
        "lib": ["dom", "es2015", "es2017"]
    },
    "include": [
        "./src/**/*"
    ]
}
```