---
title: Testing React Components
---

_The recommended testing framework is [Jest](https://jestjs.io/). This guide assumes that you followed the [Unit testing](/docs/how-to/testing/unit-testing) guide to set up Jest and that you are using Jest 29 or above._

The [@testing-library/react](https://github.com/testing-library/react-testing-library) by Kent C. Dodds has risen in popularity since its release and is a great replacement for [enzyme](https://github.com/airbnb/enzyme). You can write unit and integration tests and it encourages you to query the DOM in the same way the user would. Hence the guiding principle:

> The more your tests resemble the way your software is used, the more confidence they can give you.

It provides light utility functions on top of `react-dom` and `react-dom/test-utils` and gives you the confidence that refactors of your component in regards to the implementation (but not functionality) don't break your tests.

## Installation

Install the library as one of your project's `devDependencies`. Optionally you may install `jest-dom` to use its [custom jest matchers](https://github.com/testing-library/jest-dom#custom-matchers).

```shell
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

Create the file `setup-test-env.js` at the root of your project. Insert this code into it:

```js:title=setup-test-env.js
import "@testing-library/jest-dom"
```

This file gets run automatically by Jest before every test and therefore you don't need to add the imports to every single test file.

Lastly you need to tell Jest where to find this file. Open your `jest.config.js` and add this entry to the bottom after `setupFiles`:

```js:title=jest.config.js
module.exports = {
  testEnvironment: `jsdom`,
  setupFilesAfterEnv: ["<rootDir>/setup-test-env.js"],
}
```

**Please note:** The `testEnvironment` default is `node`. If you don't want to switch it globally you can use a `@jest-environment` comment, see [testEnvironment docs](https://jestjs.io/docs/configuration/#testenvironment-string).

## Usage

Let's create a little example test using the newly added library. If you haven't done so already, read the [unit testing guide](/docs/how-to/testing/unit-testing). There are a lot of options when it comes to selectors, this example chooses `getByTestId` here. It also utilizes `toHaveTextContent` from `jest-dom`:

```js
import React from "react"
import { render } from "@testing-library/react"

// You have to write data-testid
const Title = () => <h1 data-testid="hero-title">Gatsby is awesome!</h1>

test("Displays the correct title", () => {
  const { getByTestId } = render(<Title />)
  // Assertion
  expect(getByTestId("hero-title")).toHaveTextContent("Gatsby is awesome!")
  // --> Test will pass
})
```
