# gatsby-plugin-typescript

Provides drop-in support for TypeScript and TSX.

## Install

`npm install gatsby-plugin-typescript`

## How to use

1.  Include the plugin in your `gatsby-config.js` file.
1.  Write your components in TSX or TypeScript.
1.  You're good to go.

`gatsby-config.js`

```javascript
module.exports = {
  // ...,
  plugins: [`gatsby-plugin-typescript`],
}
```

_**Please note**: If packages don't ship with TypeScript definitions you'll need to manually install those type definitions, e.g. for React. A typical Gatsby project would need: `npm install --save-dev @types/react @types/react-dom @types/node`_

## Options

When adding this plugin to your `gatsby-config.js`, you can pass in options to override the default [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript#options) config.

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true, // defaults to false
        jsxPragma: `jsx`, // defaults to "React"
        allExtensions: true, // defaults to false
      },
    },
  ],
}
```

For more detailed documentation on the available options, visit https://babeljs.io/docs/en/babel-preset-typescript#options.

## Caveats

This plugin uses [`babel-plugin-transform-typescript`](https://babeljs.io/docs/en/babel-plugin-transform-typescript.html)
to transpile TypeScript. It does _not do type checking_. Also since the TypeScript
compiler is not involved, the following applies:

> Does not support namespaces.
> Workaround: Move to using file exports, or
> migrate to using the module { } syntax instead.
>
> Does not support const enums because those require
> type information to compile. Workaround: Remove the
> const, which makes it available at runtime.
>
> Does not support export = and import =, because those
> cannot be compiled to ES.next. Workaround: Convert
> to using export default and export const,
> and import x, {y} from "z".
>
> Does not support baseUrl.
> Workaround: use [gatsby-plugin-root-import](https://www.gatsbyjs.org/packages/gatsby-plugin-root-import/)
> and configure it to point the baseUrl value (also set baseUrl option in tsconfig.json file).

https://babeljs.io/docs/en/babel-plugin-transform-typescript.html

## Type checking

First of all you should set up your IDE so that type errors are surfaced.
Visual Studio Code is very good in this regard.

In addition, you can see the instructions in [TypeScript-Babel-Starter](https://github.com/Microsoft/TypeScript-Babel-Starter)
for setting up a `type-check` task.
