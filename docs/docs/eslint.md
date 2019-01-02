---
title: ESLint
---

## Why use ESLint

Gatsby ships with Prettier, which is a simple, opinionated code _formatter_. [ESLint](https://eslint.org) can be both a _linter_ and _formatter_, meaning you can use it to check for syntactical errors as well as formatting. Prettier will work for most sites, however if you'd like to add linting capabilities _and_ highly-configurable formatting you should implement ESLint into your Gatsby project.

## How to use ESLint

Here we will explore an ESLint configuration that acts like Prettier by adhering to [Standard.js](https://standardjs.com) rules. ESLint might seem intimidating at first, however it is aimed at providing a number of configurable options to make your code format fit your style. Run the following commands to remove Prettier and install ESLint.

```shell
# Remove the Prettier package
npm rm prettier

# Install ESLint and its packages
npm install --save-dev eslint babel-eslint \
  eslint-config-standard eslint-plugin-node \
  eslint-plugin-standard eslint-plugin-react \
  eslint-plugin-import eslint-plugin-promise \
```

Now that we have our packages installed, remove `.prettierrc` from the root of your new Gatsby project and create a new file named `.eslintrc.js` using the commands below.

```shell
# Remove the Prettier config file
rm .prettierrc

# Create a config file for ESLint
touch .eslintrc.js
```

### Configuring ESLint

We recommend copying our default .eslintrc.js content below to your newly created `.eslintrc.js` file and modifying it per your needs. Reference ESLint's [rules documentation](https://eslint.org/docs/rules/) for more options.

```js:title=.eslintrc.js
module.exports = {
  extends: ["standard"],
  plugins: ["standard", "react"],
  rules: {
    "no-var": "error", // optional, recommended when using es6+
    "no-unused-vars": 1, // recommended
    "arrow-spacing": ["error", { before: true, after: true }], // recommended
    indent: ["error", 2],
    "comma-dangle": [
      "error",
      {
        objects: "only-multiline",
        arrays: "only-multiline",
        imports: "never",
        exports: "never",
        functions: "never",
      },
    ],

    // options to emulate prettier setup
    semi: ["error", "never"],
    "max-len": ["error", { code: 80 }],
    "template-curly-spacing": ["error", "always"],
    "arrow-parens": ["error", "as-needed"],

    // standard.js
    "space-before-function-paren": [
      "error",
      {
        named: "always",
        anonymous: "always",
        asyncArrow: "always",
      },
    ],

    // standard plugin - options
    "standard/object-curly-even-spacing": ["error", "either"],
    "standard/array-bracket-even-spacing": ["error", "either"],
    "standard/computed-property-even-spacing": ["error", "even"],
    "standard/no-callback-literal": ["error", ["cb", "callback"]],

    // react plugin - options
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 8, // optional, recommended 6+
  },
}
```
