---
title: "Cypress"
---

[Cypress](https://www.cypress.io/) is one of the options when it comes to end-to-end testing. Setting up and writing tests in Cypress is developer-friendly and easy to learn. You'll profit from the time travel feature or the extensive debugging capabilities with Chrome DevTools. Of course you can also use it with Gatsby and this guide will explain how.

In order to run Gatsby's development server and Cypress at the same time we'll use the little helper [start-server-and-test](https://github.com/bahmutov/start-server-and-test). If you're already using [react-testing-library](docs/react-testing-library) you might want to install `cypress-testing-library`, too. Install the following packages to your `devDependencies`:

```sh
npm install --save-dev cypress start-server-and-test
```

We also want our urls used by `cy.visit()` or `cy.request()` to be prefixed hence we create the file `cypress.json` at the root of our project with the following content:

```json
{
  "baseUrl": "http://localhost:8000/"
}
```

Last but not least we add additional scripts to our `package.json` to run Cypress:

```json
{
  "scripts": {
    "develop": "gatsby develop",
    "cy:open": "cypress open",
    "test:e2e": "start-server-and-test develop http://localhost:8000 cy:open"
  }
}
```

Run `test:e2e` in your command line and see Cypress running for the first time. A folder named `cypress` will be created at the root of your project and a new application window will pop up. Cypress' [getting started guide](https://docs.cypress.io/guides/getting-started/writing-your-first-test.html#) is a good start to learn how to write tests!

### Continuous Integration

If you want to run Cypress in Continuous Integration (CI) you have to use `cypress run` instead of `cypress open`:

```json
{
  "scripts": {
    "develop": "gatsby develop",
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "test:e2e:ci": "start-server-and-test develop http://localhost:8000 cy:run"
  }
}
```

Please read the official [documentation](https://docs.cypress.io/guides/guides/continuous-integration.html) on CI if you want to know how to setup Travis or Gitlab with Cypress.
