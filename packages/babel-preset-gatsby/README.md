# babel-preset-gatsby

Gatsby uses the phenomenal project [Babel](https://babeljs.io/) to enable support for writing modern JavaScript — while still supporting older browsers. This package contains the default Babel setup for all Gatsby projects.

## Packages

- [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env)
- [`@babel/preset-react`](https://babeljs.io/docs/en/babel-preset-react)
- [`@babel/preset-flow`](https://babeljs.io/docs/en/babel-preset-flow)
- [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)
- [`@babel/plugin-proposal-optional-chaining`](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining)
- [`@babel/plugin-transform-runtime`](https://babeljs.io/docs/en/babel-plugin-transform-runtime#docsNav)

## Usage

Install `babel-preset-gatsby` and add a `.babelrc` file with the following content to the root of your project:

```bash
npm install --dev babel-preset-gatsby
```

```json
{
  "presets": ["babel-preset-gatsby"]
}
```

## Options

### `browser`

`boolean`, defaults to `false`.

Defines if [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env) is configured to target browsers or Node.js environments.

### `debug`

`boolean`, defaults to `false`.

Outputs the targets/plugins used and the version specified in [plugin data version](https://github.com/babel/babel/blob/master/packages/babel-preset-env/data/plugins.json) to `console.log`.

### `targets`

`{ [string]: number | string }`, defaults to `{ "browsers": ["last 4 versions", "safari >= 7", "ie >= 9"] }` in production and `{ "browsers": ["last 2 versions", "not ie <= 11", "not android 4.4.3"] }` in development when targeting the browser and `{ "node": 6 }` in production and `{ "node": "current" }` in development when targeting Node.js.

Use this option to configure [custom target browsers](https://www.gatsbyjs.org/docs/babel/).

