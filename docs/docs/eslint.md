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

Now that we have our packages installed, in the root of your project remove the existing Prettier configuration and create a new file named `.eslintrc.js` using the commands below.

```shell
# Remove the Prettier config file
rm .prettierrc

# Create a config file for ESLint
touch .eslintrc.js
```

## Configuring ESLint

To get started configuring ESLint we recommend copying our default ESLint content below to your newly created `.eslintrc.js` file and modifying it per your needs. Reference ESLint's [rules documentation](https://eslint.org/docs/rules/) for more options. Sample rules from the plugins are also provided to demonstrate their capabilities.

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

    // prettier - gatsby-starter-default options
    "prettier/prettier": ["error", {
      "printWidth": 80,
      "tabWidth": "error",
      "useTabs": false,
      "semi": false,
      "singleQuote": false,
      "endOfLine": "lf",
      "jsxSingleQuote": false,
      "trailingComma": "es5",
      "bracketSpacing": true,
      "jsxBracketSameLine": false,
      "arrowParens": "avoid"
    }]
  }
};
```

### Running ESLint with a Script

Now we will begin by adding a two `lint` scripts in your project's `package.json` file as shown below:

```json:title=package.json
{
  "scripts": {
    "build": "gatsby build",
    "develop": "gatsby develop",
    "start": "npm run develop",
    "serve": "gatsby serve",
    "test": "echo \"Write tests! -> https://gatsby.app/unit-testing\"",
    "format": "prettier --write src/**/*.{js,jsx}",
    "lint": "eslint --config .eslintrc.js src",
    "lint:fix": "eslint --config .eslintrc.js --fix src"
  },
}
```

After the scripts are set up, you can try them out! It is optional to remove the `format` script, now that Prettier will be run with ESLint.

- `lint` - ESLint will identify warnings and errors
- `lint:fix`
  - Prettier will format your code
  - ESLint will format any fixable warnings or errors, along with custom rules outside of Prettier

Rules in our new ESLint configuration have been set to `warn` or `error`, which can be very helpful for ensuring quality code adding [gatsby-plugin-eslint](https://www.gatsbyjs.org/packages/gatsby-plugin-eslint/?=eslint). This package will add ESLint capabilities to the Gatsby development process, thus providing all of the linting capabilities described in the scripts above while your building your new project.

### Integrating ESLint with VS Code

Adding ESLint to VS Code needs a little more configuring unlike the Prettier extension [as described in the Gatsby tutorial](https://www.gatsbyjs.org/tutorial/part-zero/#set-up-a-code-editor). Refer to the following steps to add and configure ESLint:

1. Open the extensions view on VS Code (View => Extensions).
2. Search for “ESLint”.
3. Click “Install”
4. Open your VS Code settings as JSON (CMD/Ctrl+Shift+P => "Preferences: Open Settings (JSON)")
5. Input the following, we will cover:
  1. Disabling VS Code's built-in formatting
  2. Enabling ESLint validation
  3. Enabling ESLint auto-fix on save

```json:title=settings.json
{
  // ...
  "editor.formatOnSave": false,
  "eslint.autoFixOnSave": true,
  "eslint.validate": [
      "javascript",
      "javascriptreact",
  ],
  // ...
}
```

It is important to note that by disabling VS Code's built-in formatting, HTML files and alike will not be formatted. But not to worry, you can re-enable settings per language:

```json:title=settings.json
{
  // ...
  "[html]": {
    "editor.formatOnSave": true,
  },
  // ...
}
```

## Conclusion

Now you have a powerful environment formatting and highlighting mistakes as you go! To summarize, in this section we learned to:

- Install ESLint and integrate with Prettier
- Configure ESLint
- Use scripts to run linting and fixing/formatting
- Integrate with VS Code and format on save
- Disable VS Code's built-in formatting
- Enabling VS Code's built-in formatting per language