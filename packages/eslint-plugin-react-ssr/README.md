# eslint-plugin-react-ssr

eslint-plugin-react-ssr

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-react-ssr`:

```
$ npm install eslint-plugin-react-ssr --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-react-ssr` globally.

## Usage

Add `react-ssr` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["react-ssr"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "react-ssr/rule-name": 2
  }
}
```

## Supported Rules

- Fill in provided rules here
