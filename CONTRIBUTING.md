# How to contribute

## Filing an issue

If you want your issue to be resolved quickly, please include in your
issue:

* Gatsby version, node.js version, OS version
* The contents of your `gatsby-node.js`, `gatsby-browser.js`, and `package.json`.

## Contributing
You can install the latest `master` version of Gatsby by following these
simple steps:

* Clone the repo, navigate to its directory.
* Install Lerna if you don't have it already: `yarn global add lerna@^2.0.0-beta.0`
* Execute `yarn && lerna bootstrap` to install dependencies and cross link all the packages.
* Use `git pull` to update to latest Gatsby.

Test suite can be run via `yarn test`.

This project uses [FlowType](https://flowtype.org/) for static type checking.

The usual contributing steps are:

* Fork the [official repository](https://github.com/gatsbyjs/gatsby).
* Clone your fork: git clone `git@github.com:<your-username>/gatsby.git`
* Install dependencies: `yarn && lerna bootstrap`
* Make sure tests are passing for you: `lerna run test`
* Create a topic branch: `git checkout -b topics/new-feature-name`
* Run `yarn build && yarn watch` to watch code and compile your changes.
* Symlink the built file from whatever plugin you're trying to modify (will be in `packages/package-name`) into your project's `node_modules/package-name` directory to avoid getting the node_modules folder coming across to your site.
* Add tests and code for your changes.
* Once you‘re done, make sure all tests still pass: `yarn test`
* Commit and push to your fork.
* Create an pull request from your branch.
