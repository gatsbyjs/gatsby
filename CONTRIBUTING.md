# Filing an issue

If you want your issue to be resolved quickly, please include in your
issue:

* Gatsby version, node.js version, OS version
* The contents of your `gatsby-node.js`, `gatsby-browser.js`, and `package.json`.

# Contributing
You can install the latest `master` version of Gatsby by following these
simple steps:

* Clone the repo, navigate to its directory.
* Install Lerna if you don't have it already: `yarn global add lerna@^2.0.0-beta.0`
* Execute `lerna bootstrap` to install dependencies and cross link all the packages.
* Execute `yarn global uninstall gatsby && yarn link` to make your dev version of gatsby the version you get when you run `gatsby`.
* Use `git pull` to update to latest Gatsby.

Test suite can be run via `yarn test`.

This project uses [FlowType](https://flowtype.org/) for static type checking.

The usual contributing steps are:

* Fork the [official repository](https://github.com/gatsbyjs/gatsby).
* Clone your fork: git clone `git@github.com:<your-username>/gatsby.git`
* Make sure tests are passing for you: `lerna bootstrap && lerna run test`
* Create a topic branch: `git checkout -b topics/new-feature-name`
* Run `yarn watch` to watch code and compile your changes.
* Clone one of the official repositories and "link" your fork of Gatsby
  to it (run `yarn link gatsby`).
* Add tests and code for your changes.
* Once you‘re done, make sure all tests still pass: `lerna bootstrap && yarn test`
* Commit and push to your fork.
* Create an pull request from your branch.
