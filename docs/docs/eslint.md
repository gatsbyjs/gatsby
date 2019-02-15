---
title: ESLint
---

## Why use ESLint

Gatsby ships with Prettier, which is a simple, opinionated code _formatter_. [ESLint](https://eslint.org) can be both a _linter_ and _formatter_, meaning you can use it to check for syntactical errors as well as formatting. Prettier will work for most sites, however if you'd like to add linting capabilities _and_ highly-configurable formatting you should implement ESLint into your Gatsby project.

## How to use ESLint

Here we will explore an ESLint configuration that will still use Prettier for formatting, but also provide linting rules recommended by the plugins. ESLint might seem intimidating at first, however it is aimed at providing a number of configurable options to make your code format fit your style. Run the following commands to install ESLint and the packages necessary for Prettier integration.

```shell
# Install ESLint and its packages
npm install --save-dev eslint babel-eslint \
  eslint-plugin-prettier eslint-config-prettier \
  eslint-plugin-react eslint-plugin-jsx-a11y \
  eslint-plugin-import eslint-plugin-promise \
  eslint-plugin-node
```

Now that we have our packages installed, in the root of your project create a new file named `.eslintrc.js` using the commands below.

```shell
# Remove the Prettier config file
rm .prettierrc

# Create a config file for ESLint
touch .eslintrc.js
```

## Configuring ESLint

We recommend copying our default ESLint content below to your newly created `.eslintrc.js` file and modifying it per your needs. Reference ESLint's [rules documentation](https://eslint.org/docs/rules/) for more options. Sample rules from the plugins are also provided to demonstrate their capabilities.

```js:title=.eslintrc.js
module.exports = {
  extends: [
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
    "prettier/react",
  ],
  plugins: [
    "prettier",
    "react",
    "jsx-a11y",
  ],
  parser: "babel-eslint",
  parserOptions: {
    "ecmaVersion": 8,
    "ecmaFeatures": {
      "impliedStrict": true,
      "classes": true,
      "jsx": true
    }
  },
  env: {
    "browser": true,
    "es6": true
  },
  settings: {
    react: {
      "version": "latest"
    },
  },
  rules: {
    // https://github.com/yannickcr/eslint-plugin-react#configuration
    "react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx"] }],
    "react/jsx-uses-react": "error",
    "react/react-in-jsx-scope": "error",
    "react/no-deprecated": "error",
    "react/prefer-stateless-function": "warn",

    // https://www.npmjs.com/package/eslint-plugin-jsx-a11y#supported-rules
    "jsx-a11y/accessible-emoji": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/alt-text": "warn",

    // prettier - default options
    "prettier/prettier": ["error", {
      "printWidth": 80,
      "tabWidth": "error",
      "useTabs": false,
      "semi": false,
      "singleQuote": false,
      "jsxSingleQuote": false,
      "trailingComma": "es5",
      "bracketSpacing": true,
      "jsxBracketSameLine": false,
      "arrowParens": "avoid"
    }]
  }
};
```
