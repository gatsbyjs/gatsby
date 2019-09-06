---
title: End-to-End Testing
---

[Cypress](https://www.cypress.io/) is one of the options when it comes to end-to-end (E2E) testing. Cypress is an all-in-one testing framework focused on E2E testing, meaning that you don't have to install 10 different things to get your test suite set up. You can write your first passing test in minutes without any configuration with the help of Cypress' API, which is easy to read and understand. It runs tests as fast as your browser can render content, which also makes test-driven development possible. You'll also profit from the time travel feature or the extensive debugging capabilities with Chrome DevTools. Of course you can also use it with Gatsby, and this guide will explain how.

In order to run Gatsby's development server and Cypress at the same time you'll use the little helper [start-server-and-test](https://github.com/bahmutov/start-server-and-test). If you're already using [@testing-library/react](https://github.com/testing-library/react-testing-library) for [unit testing](/docs/unit-testing) you might want to install [@testing-library/cypress](https://github.com/testing-library/cypress-testing-library), too. This way you can use the exact same methods you used with `@testing-library/react` in your Cypress tests. Install the following packages to your `devDependencies`:

```shell
npm install --save-dev cypress start-server-and-test
```

We also want the URLs used by `cy.visit()` or `cy.request()` to be prefixed, hence you have to create the file `cypress.json` at the root of your project with the following content:

```json:title=cypress.json
{
  "baseUrl": "http://localhost:8000/"
}
```

Last but not least you add additional scripts to your `package.json` to run Cypress:

```json:title=package.json
{
  "scripts": {
    "develop": "gatsby develop",
    // highlight-start
    "cy:open": "cypress open",
    "test:e2e": "start-server-and-test develop http://localhost:8000 cy:open"
    // highlight-end
  }
}
```

Run `test:e2e` in your command line and see Cypress running for the first time. A folder named `cypress` will be created at the root of your project and a new application window will pop up. [Cypress' getting started guide](https://docs.cypress.io/guides/getting-started/writing-your-first-test.html#) is a good start to learn how to write tests!

_Important note_: If you are running Gatsby with the `--https` flag, whether using your own or automatically generated certificates, you will also need to tell `start-server-and-test` to disable HTTPS certificate checks (otherwise it will wait forever and never actually launch Cypress. You do this by passing in an environmental variable: `START_SERVER_AND_TEST_INSECURE=1`. [start-server-and-test docs](https://github.com/bahmutov/start-server-and-test#disable-https-certificate-checks).

This means your `test:e2e` script would look like this:

```json:title=package.json
"test:e2e": "START_SERVER_AND_TEST_INSECURE=1 start-server-and-test develop http://localhost:8000 cy:open"
```

### Continuous Integration

If you want to run Cypress in Continuous Integration (CI) you have to use `cypress run` instead of `cypress open`:

```json:title=package.json
{
  "scripts": {
    "develop": "gatsby develop",
    "cy:open": "cypress open",
    "cy:run": "cypress run", // highlight-line
    "test:e2e": "start-server-and-test develop http://localhost:8000 cy:open",
    "test:e2e:ci": "start-server-and-test develop http://localhost:8000 cy:run" // highlight-line
  }
}
```

Please read the [Cypress' official documentation](https://docs.cypress.io/guides/guides/continuous-integration.html) on CI if you want to know how to setup Travis or GitLab with Cypress.

## Writing tests

A good use case for writing automated end-to-end tests is asserting **accessibility** with [cypress-axe](https://github.com/avanslaars/cypress-axe), a Cypress plugin that incorporates the [axe](https://deque.com/axe) accessibility testing API. While some [manual testing](https://www.smashingmagazine.com/2018/09/importance-manual-accessibility-testing/) is still required to ensure good web accessibility, automation can ease the burden on human testers.

To use cypress-axe you have to install `cypress-axe` and [axe-core](https://github.com/dequelabs/axe-core). You'll also use some commands from [@testing-library/cypress](https://testing-library.com/docs/cypress-testing-library/intro) to target elements easier:

```bash
npm install --save-dev cypress-axe axe-core @testing-library/cypress
```

Then you add the `cypress-axe` and `@testing-library/cypress` commands in `cypress/support/commands.js`:

```js:title=cypress/support/commands.js
import "./commands"
//highlight-start
import "cypress-axe"
import "@testing-library/cypress/add-commands"
//highlight-end
```

Cypress right now will look for tests inside the `cypress/integration` folder. It makes sense to create a new folder `cypress/e2e` (end to end). You can use that folder for tests by adding the following in your `cypress.json`:

```json:title=cypress.json
{
  "baseUrl": "http://localhost:8000/",
  "integrationFolder": "cypress/e2e" // highlight-line
}
```

Create a new file inside `cypress/e2e` folder and name it `a11y.test.js`.

You'll use the `beforeEach` hook to run some commands before each test. After cypress loads the homepage you'll use the `checkA11y` method from `cypress-axe` to check for accessibility violations:

```js:title=cypress/e2e/a11y.test.js
/// <reference types="Cypress" />

describe("Accessibility checks", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.injectAxe()
    cy.wait(500)
  })
  it("Has no detectable a11y violations on load", () => {
    cy.checkA11y()
  })
})
```

You can run `test:e2e` to run the test. If you already have the development server open you can run `cy:open` instead.

One thing to keep in mind is that you can't always see the exact error message from the sidebar (command log). For that, you have to open the browser developer console and find the message in the output. You can see how an accessibility error looks in the [cypress-axe GitHub page](https://github.com/avanslaars/cypress-axe#output).

You don't have to use the `checkA11y` method only on page load. For example, you can perform a click on a button and check again. This is especially useful if that button opens a modal or a mobile menu for example.

The following test is for the [gatsby-default-starter](https://github.com/gatsbyjs/gatsby-starter-default). Cypress visits the homepage and searches for the link that goes to page 2 with the `getByText` command. Then, performs a click event on that link and checks for accessibility errors on the second page.

```js:title=cypress/e2e/a11y.test.js
/// <reference types="Cypress" />

describe("Accessibility checks", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.injectAxe()
    cy.wait(500)
  })
  it("Has no detectable a11y violations on load", () => {
    cy.checkA11y()
  })
  // highlight-start
  it("Navigates to page 2 and checks for accessibility violations", () => {
    cy.getByText(/go to page 2/i)
      .click()
      .checkA11y()
  })
  // highlight-end
})
```

You can also make [assertions](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html#Assertions) with the [should command](https://docs.cypress.io/api/commands/should.html#Syntax).

In `gatsby-default-starter` homepage you can write another test that focuses on the footer link. Then you make some assertions on the item that's currently focused:

```js:title=cypress/e2e/a11y.test.js
/// <reference types="Cypress" />

describe("Accessibility checks", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.injectAxe()
    cy.wait(500)
  })
  it("Has no detectable a11y violations on load", () => {
    cy.checkA11y()
  })
  it("Navigates to page 2 and checks for accessibility violations", () => {
    cy.getByText(/go to page 2/i)
      .click()
      .checkA11y()
  })
  // highlight-start
  it("Checks if footer link is focusable and has the correct attributes", () => {
    cy.getAllByText("Gatsby").focus()

    cy.focused()
      .should("have.text", "Gatsby")
      .should("have.attr", "href", "https://www.gatsbyjs.org")
      .should("not.have.css", "outline-width", "0px")
  })
  // highlight-end
})
```
