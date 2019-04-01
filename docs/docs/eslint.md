---
title: ESLint
---

## Why use ESLint

Gatsby ships with Prettier, which is a simple, opinionated code _formatter_. [ESLint](https://eslint.org) can be both a _linter_ and _formatter_, meaning you can use it to check for syntactical errors as well as formatting. Prettier will work for most sites, however if you'd like to add linting capabilities _and_ highly-configurable formatting you should implement ESLint into your Gatsby project.

## How to use ESLint

Here we will explore an ESLint configuration designed to be used with React applications. ESLint might seem intimidating at first, however it is aimed at providing a number of configurable options to make your code format fit your style. Run the following commands to remove Prettier and install ESLint and necessary dependencies.

```shell
# Remove the Prettier package
npm rm prettier

# Install install the necessary ESLint dependencies
npm install --save-dev eslint-config-react-app babel-eslint@9.x \
eslint@5.x eslint-plugin-flowtype@2.x eslint-plugin-import@2.x \
eslint-plugin-jsx-a11y@6.x eslint-plugin-react@7.x

```

Now that we have our packages installed, remove `.prettierrc` from the root of your new Gatsby project and create a new file named `.eslintrc.js` using the commands below.

```shell
# Remove the Prettier config file
rm .prettierrc

# Create a config file for ESLint
touch .eslintrc.js
```

### Configuring ESLint

We recommend copying the following .eslintrc.js content below to your newly created `.eslintrc.js` file and modifying it per your needs. Reference ESLint's [rules documentation](https://eslint.org/docs/rules/) for more options.

```js:title=.eslintrc.js
module.exports = {
  globals: {
    graphql: true,
    __PATH_PREFIX__: true,
  },
  extends: `react-app`,
}
```
