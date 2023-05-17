---
title: End-to-End Testing
examples:
  - label: Using Cypress
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-cypress"
---

## Introduction

[Cypress](https://www.cypress.io/) is one of the options when it comes to end-to-end (E2E) testing. With Cypress, you can easily create tests for your modern web applications, debug them visually, and automatically run them in your continuous integration builds. Another popular alternative is [Playwright](https://playwright.dev/) which also works great with Gatsby.

This guide will focus on Cypress though.

## Prerequisites

- An existing Gatsby site. (Need help creating one? Follow the [Quick Start](/docs/quick-start/).)
- TypeScript as a `devDependencies` installed. You can install it like so:

  ```shell
  npm install --save-dev typescript
  ```

- `cypress`, `start-server-and-test`, and `gatsby-cypress` installed. You can install them like so:

  ```shell
  npm install --save-dev cypress start-server-and-test gatsby-cypress
  ```

## Initial setup

After creating the necessary [Cypress configuration file](https://docs.cypress.io/guides/references/configuration) you'll set up `start-server-and-test` to run Gatsby's development server and Cypress together.

1. Create a Cypress configuration file at the root of your project called `cypress.config.ts`. You can use it to e.g. preface the URLs used by `cy.visit()` as well as set the folder the tests are in by adding the following:

   ```ts:title=cypress.config.ts
   import { defineConfig } from "cypress"

   export default defineConfig({
     e2e: {
       baseUrl: `http://localhost:8000`,
       specPattern: `cypress/e2e`
     }
   })
   ```

   With this setup all `cy.visit()` calls will be prefixed with `http://localhost:8000` by default.

1. Add a `test:e2e` script to your `package.json` so that you can more quickly run Cypress and Gatsby together:

   ```json:title=package.json
   {
     "scripts": {
       "develop": "gatsby develop",
       // highlight-start
       "cy:open": "cypress open --browser chrome --e2e",
       "test:e2e": "CYPRESS_SUPPORT=y start-server-and-test develop http://localhost:8000 cy:open"
       // highlight-end
     }
   }
   ```

   The `CYPRESS_SUPPORT` environment variable enables test utilities inside Gatsby. When you run `test:e2e` the `develop` script will be executed, the script waits until `http://localhost:8000` is ready and then it executes `cy:open`.

1. Run the `test:e2e` script to initialize a Cypress project.

1. Setup the [`gatsby-cypress`](https://www.npmjs.com/package/gatsby-cypress) commands like so:

   ```ts:title=cypress/support/e2e.ts
   import "gatsby-cypress/commands"
   ```

This initial setup enables you to iterate quickly on your tests as you're using `gatsby develop`. If you want to ensure that your production deployment is also passing your tests, read the [Continuous Integration](#continuous-integration) section on how to use Cypress with `gatsby build`.

### Using with `--https` flag

If you are running `gatsby develop` with the [`--https` flag enabled](/docs/reference/gatsby-cli/#develop), whether using your own or automatically generated certificates, you will also need to tell `start-server-and-test` to disable HTTPS certificate checks.

Otherwise it will wait forever and never actually launch Cypress. You can do this by passing in an environmental variable: `START_SERVER_AND_TEST_INSECURE=1`

This means your `test:e2e` script would look like this:

```json:title=package.json
{
  "scripts": {
    "test:e2e": "START_SERVER_AND_TEST_INSECURE=1 CYPRESS_SUPPORT=y start-server-and-test develop http://localhost:8000 cy:open"
  }
}
```

## Writing tests

Explaining Cypress in detail is beyond the scope of this guide. Please read Cypress' documentation, especially [Writing your first E2E test](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) to learn more.

We recommend installing [`@testing-library/cypress`](https://github.com/testing-library/cypress-testing-library) for additional useful matchers.

### Testing accessibility

A good use case for writing automated end-to-end tests is asserting accessibility with [`cypress-axe`](https://github.com/avanslaars/cypress-axe), a Cypress plugin that incorporates the [axe](https://deque.com/axe) accessibility testing API. While some [manual testing](https://www.smashingmagazine.com/2018/09/importance-manual-accessibility-testing/) is still required to ensure good web accessibility, automation can ease the burden on human testers.

To use `cypress-axe`, you have to install it and [axe-core](https://github.com/dequelabs/axe-core). You'll also use some commands from [@testing-library/cypress](https://testing-library.com/docs/cypress-testing-library/intro) to select elements — see [best practices for selecting elements](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements).

1. Install the necessary packages:

   ```shell
   npm install --save-dev cypress-axe axe-core @testing-library/cypress
   ```

1. Add their commands to `cypress/support/e2e.ts`:

   ```ts:title=cypress/support/e2e.ts
   import "gatsby-cypress/commands"
   // highlight-start
   import "cypress-axe"
   import "@testing-library/cypress/add-commands"
   // highlight-end
   ```

1. You can now write a test like so:

   ```ts:title=cypress/e2e/accessibility.cy.ts
   describe("Accessibility tests", () => {
     beforeEach(() => {
         cy.visit("/").waitForRouteChange().get("main")
         cy.injectAxe()
     })
     it("Has no detectable accessibility violations on load", () => {
       cy.checkA11y()
     })
     it("Navigates to page 2 and checks for accessibility violations", () => {
       cy.findByText(/go to page 2/i)
         .click()
         .waitForRouteChange()
         .checkA11y()
     })
     it("Focuses on the footer link and asserts its attributes", () => {
       cy.findAllByText("Gatsby").focus()

       cy.focused()
         .should("have.text", "Gatsby")
         .should("have.attr", "href", "https://www.gatsbyjs.com")
         .should("not.have.css", "outline-width", "0px")
     })
   })
   ```

Check out the [cypress-axe documentation](https://github.com/component-driven/cypress-axe) for more examples.

## Continuous Integration

In order to run Cypress inside a Continuous Integration (CI) environment like GitHub Actions, CircleCI, etc. you have to use `cypress run` instead of `cypress open`. Additionally, you should also use `gatsby build` and `gatsby serve` to best imitate the production environment of your live website.

One option is to configure your `scripts` inside `package.json` like so:

```json:title=package.json
{
  "scripts": {
    "build": "gatsby build",
    "serve": "gatsby serve",
    // highlight-start
    "cy:run": "CYPRESS_baseUrl=http://localhost:9000 cypress run --browser chrome",
    "test:e2e:ci": "CYPRESS_SUPPORT=y npm run build && start-server-and-test serve http://localhost:9000 cy:run"
    // highlight-end
  }
}
```

You would then run the `test:e2e:ci` script inside your CI.

Read the [CI Introduction](https://docs.cypress.io/guides/continuous-integration/introduction) to learn more about all the different options. For example, if you don't want to use the `CYPRESS_baseUrl` environment variable to change the `baseUrl` you could also define a separate Cypress config and use it instead of the default one.

## Additional Resources

- [Cypress documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [gatsby-cypress](https://www.npmjs.com/package/gatsby-cypress)
- [cypress-axe](https://github.com/component-driven/cypress-axe)
