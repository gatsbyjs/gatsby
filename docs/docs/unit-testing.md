---
title: Unit testing
---

Unit testing is a great way to protect against errors in your code before you
deploy it. While Gatsby does not include support for unit testing out of the
box, it is quite easy to get up and running. However there are a few features of
the Gatsby build process that mean the standard Jest setup doesn't quite work.

## Setting up your environment

The most popular testing framework for React is [Jest](https://jestjs.io/),
which was created by Facebook. While Jest is a general purpose JavaScript unit
testing framework, it has lots of features that make it work particularly well
with React.

For this guide, we will be starting with `gatsby-starter-blog`, but the concepts
should be the same or very similar for your site.

First you need to install Jest and some more required packages. We need to
install Babel 7 as it's required by Jest.

```sh
yarn add -D jest babel-jest react-test-renderer 'babel-core@^7.0.0-0' @babel/core identity-obj-proxy @babel/plugin-proposal-class-properties @babel/plugin-proposal-optional-chaining
```

Because Gatsby handles its own Babel configuration, you will need to manually
tell Jest to use `babel-jest`. The easiest way to do this is to add a `"jest"`
section in your `package.json`. We can set up some useful defaults at the same
time:

```json
  "jest": {
    "transform": {
      "^.+\\.jsx?$": "<rootDir>/jest-preprocess.js"
    },
    "testRegex": "/.*(__tests__\\/.*)|(.*(test|spec))\\.jsx?$",
    "moduleNameMapper": {
      ".+\\.(css|styl|less|sass|scss)$": "identity-obj-proxy",
      ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js"
    },
    "testPathIgnorePatterns": ["node_modules", ".cache"],
    "transformIgnorePatterns": [
      "node_modules/(?!(gatsby)/)"
    ]
  }
```

The `transform` section tells Jest that all `js` or `jsx` files need to be
transformed using a `jest-preprocess.js` file in the project root. Let's go
ahead and create this file now. This is where we set up our Babel config. We can
start with a minimal config.

```js
// jest-preprocess.js
const babelOptions = {
  presets: ["@babel/react", "@babel/env"],
  plugins: [
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-class-properties",
  ],
}

module.exports = require("babel-jest").createTransformer(babelOptions)
```

Back to our Jest config, we can see the next option is `testRegex`. This is the
pattern telling Jest which files contain tests. The pattern above matches any
`.js` file inside a `__tests__` directory, or any file elsewhere with the
extension `.test.js` or `.spec.js`. We ignore any tests in the `node_modules` or
`.cache` directories.

The `moduleNameMapper` sectipon works a bit like Webpack rules, and tells Jest
how to handle imports. We are mainly concerned here with mocking static file
imports, which Jest can't handle. A mock is a dummy module that is used instead
of the real module inside tests. It is good when you have something that you
can't or don't want to test. We have two types that we mock: stylesheets, and
everything else. For stylesheets we use the package `identity-obj-proxy`. For
all other files we use a manual mock, which we are calling `fileMock.js`. We
need to create this ourselves. The convention is to create a directory called
`__mocks__` in the root directory for this. Note the pair of double underscores
in the name.

```js
// __mocks__/fileMock.js
module.exports = "test-file-stub"
```

The final config setting is `transformIgnorePatterns`. This is very important,
and is different from what you'll find in other Jest guides. The reason we need
this is because Gastby includes un-transpiled ES6 code. By default Jest doesn't
try to transform code inside `node_modules`, so you will get an error like this:

```
/my-blog/node_modules/gatsby/cache-dir/gatsby-browser-entry.js:1
({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,global,jest){import React from "react"
                                                                                            ^^^^^^
SyntaxError: Unexpected token import
```

This is because `gatsby-browser-entry.js` isn't being transpiled before running
in Jest. We fix this by changing the default `transformIgnorePatterns` to
exclude the `gatsby` module.

## Writing tests

A full guide to unit testing is beyond the scope of this guide, but we will
start with a simple snapshot test to check that everything is working.

First we will create the test file. As you remember, we can either put these in
a `__tests__` directory, or put them elsewhere (usually next to the component
itself), with the extention `.spec.js` or `.test.js`. The decision comes down to
your own taste. For this guide we will be testing the `<Bio />` component, so we
can create a `Bio.test.js` file next to it in `src/components`:

```js
import React from "react"

import renderer from "react-test-renderer"

import Bio from "./Bio"

describe("Bio", () =>
  it("renders correctly", () => {
    const tree = renderer.create(<Bio />).toJSON()
    expect(tree).toMatchSnapshot()
  }))
```

This is a very simple snapshot test, which uses `react-test-renderer` to render
the component, and then generates a snapshot of it on first run. It then
compares future snapshots against this, which means you can quickly check for
regressions. Visit [the Jest docs](https://jestjs.io/docs/en/getting-started) to
learn more about other tests that you can write.

## Running tests

If you look inside `package.json` you will probably find that there is already a
script for `test`, which just outputs an error message. We can change this to
simply `jest`:

```json
  "scripts": {
    "test": "jest"
  }
```

This means you can now run tests by typing `yarn test` or `npm test`. If you
want you could also add a script that runs `jest --watchAll` to watch files and
run tests when they are changed.

Now, run `yarn test` and you should immediately get an error like this:

```sh
 @font-face {
    ^

    SyntaxError: Invalid or unexpected token

      2 |
      3 | // Import typefaces
    > 4 | import 'typeface-montserrat'
```

This is because our css mock doesn't recognize the `typeface-` modules. We can
fix this easily by creating a new manual mock. Back in our `__mocks__`
directory, create a file called `typeface-montserrat.js` and another called
`typeface-merriweather.js`, each with the content `{}`. Any file in the mocks
folder which has a name that matches that of a node_module is automatically used
as a mock.

Run the tests again now and it should all work! You should get a message about
the snapshot being written. This is created in a `__snapshots__` directory next
to your tests. If you take a look at it, you will see that it is a JSON
representation of the `<Bio />` component. You should check your snapshot files
into your SCM repository so that anyone can see if the tests have stopped
matching.

If you make changes that mean you need to update the snapshot, you can do this
by running `yarn test -u`.

## Using TypeScript

If you are using TypeScript, you need to make a couple of small changes to your
config. First install `ts-jest`:

```sh
yarn add -D ts-jest
```

Then edit the Jest config in your `package.json` to match this:

```json
  "jest": {
    "transform": {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "<rootDir>/jestPreprocess.js"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.([tj]sx?)$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "testPathIgnorePatterns": ["node_modules", ".cache"],
    "transformIgnorePatterns": [
      "node_modules/(?!(gatsby)/)"
    ]
  }
```

## Other potential issues

If you are using the `Link` component then you may encounter this error when
testing your component:

```
    TypeError: Cannot read property 'history' of undefined
```

This is a `react-router` error, and can be fixed by wrapping your component in a
`MemoryRouter` from `react-router-dom`. For example:

```js
import React from "react"
import renderer from "react-test-renderer"
import { MemoryRouter } from "react-router-dom"

import Bio from "./Bio"

describe("Bio", () =>
  it("renders correctly", () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Bio />
        </MemoryRouter>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  }))
```

## More information

If you need to make changes to your Babel config, you can edit the config in
`jest-preprocess.js`. You may need to enable some of the plugins used by Gatsby,
though remember you may need to install the Babel 7 versions. See
[the Gatsby Babel config guide](/docs/babel/) for some examples.

For more information on Jest testing, visit
[the Jest site](https://jestjs.io/docs/en/getting-started).
