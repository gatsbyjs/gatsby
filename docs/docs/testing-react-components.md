---
title: "Testing React components"
---

_The recommended testing framework is [Jest](https://jestjs.io/). This guide assumes that you followed the [Unit testing](/docs/unit-testing) guide to setup Jest._

Kent C. Dodds' [react-testing-library](https://github.com/kentcdodds/react-testing-library) has risen in popularity since its release and is a great replacement for [enzyme](https://github.com/airbnb/enzyme). You can write unit and integration tests and it encourages you to query the DOM in the same way the user would. Hence the guiding principle:

> The more your tests resemble the way your software is used, the more confidence they can give you.

It provides light utility functions on top of `react-dom` and `react-dom/test-utils` and gives you the confidence that refactors of your component in regards to the implementation (but not functionality) don't break your tests.

## Installation

Install the library as one of your project's `devDependencies`. Optionally you may install `jest-dom` to use its [custom jest matchers](https://github.com/gnapse/jest-dom#custom-matchers).

```shell
npm install --save-dev react-testing-library jest-dom
```

Create the file `setup-test-env.js` at the root of your project. Insert this code into it:

```js:title=setup-test-env.js
import "jest-dom/extend-expect"

// this is basically: afterEach(cleanup)
import "react-testing-library/cleanup-after-each"
```

This file gets run automatically by Jest before every test and therefore you don't need to add the imports to every single test file.

Lastly you need to tell Jest where to find this file. Open your `jest.config.js` and add this entry to the bottom after 'setupFiles':

```js:title=jest.config.js
module.exports = {
  setupTestFrameworkScriptFile: "<rootDir>/setup-test-env.js",
}
```

## Usage

Let's create a little example test using the newly added library. If you haven't done already read the [unit testing guide](/docs/unit-testing) — essentially you'll use `react-testing-library` instead of `react-test-renderer` now. There are a lot of options when it comes to selectors, this example chooses `getByTestId` here. It also utilizes `toHaveTextContent` from `jest-dom`:

```js
import React from "react"
import { render } from "react-testing-library"

// You have to write data-testid
const Title = () => <h1 data-testid="hero-title">Gatsby is awesome!</h1>

test("Displays the correct title", () => {
  const { getByTestId } = render(<Title />)
  // Assertion
  expect(getByTestId("hero-title")).toHaveTextContent("Gatsby is awesome!")
  // --> Test will pass
})
```
