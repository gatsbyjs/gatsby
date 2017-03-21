# How to contribute

## Filing an issue

If you want your issue to be resolved quickly, please include in your issue:

* Gatsby version, node.js version, OS version
* The contents of your `gatsby-config.js` and `package.json` as well as your
  `gatsby-node.js`, `gatsby-browser.js` `gatsby-ssr.js` files depending on
  changes you've made there.

## Contributing
You can install the latest `master` version of Gatsby by following these steps:

* Clone the repo, navigate to its directory.
* Install Lerna if you don't have it already: `yarn global add
  lerna@^2.0.0-beta.0`
* Execute `yarn && lerna bootstrap` to install dependencies and cross link all
  the packages.

The usual contributing steps are:

* Fork the [official repository](https://github.com/gatsbyjs/gatsby).
* Clone your fork: git clone `git@github.com:<your-username>/gatsby.git`
* Install dependencies: `yarn && lerna bootstrap`
* Make sure tests are passing for you: `lerna run test`
* Create a topic branch: `git checkout -b topics/new-feature-name`
* Run `lerna run build` to do an initial build of all packages and ensure there
  are no errors.
* Now navigate to the package you want to modify and run `yarn run watch` to
  watch that package's code and compile your changes on the fly as you work.
* Symlink the built file from the package you're modifying into your project's
  `node_modules/package-name` directory (this avoids [problems we've seen with
  using `npm|yarn
  link`](https://github.com/yarnpkg/rfcs/blob/master/text/0000-yarn-knit.md))
* Add tests and code for your changes.
* Once you‘re done, make sure all tests still pass: `yarn test`
* Commit and push to your fork.
* Create an pull request from your branch.

Test suite can be run via `yarn test`.

This project uses [FlowType](https://flowtype.org/) for static type checking.

