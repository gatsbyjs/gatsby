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
* Install dependencies using `npm install` in the root of the repo.

The usual contributing steps are:

* Fork the [official repository](https://github.com/gatsbyjs/gatsby).
* Clone your fork: git clone `git@github.com:<your-username>/gatsby.git`
* Install lerna, and gatsby-dev-cli globaly: `npm install -g lerna gatsby-dev-cli@canary`
* Checkout to the 1.0 branch: `git checkout 1.0`
* Install dependencies: `npm install && lerna bootstrap`
* Make sure tests are passing for you: `npm test`
* Create a topic branch: `git checkout -b topics/new-feature-name`
* Run `npm run watch` to do an initial build of all packages and watch for
  changes to packages' source code and compile changes on the fly as you
  work.
* For each of your Gatsby test sites, run the `gatsby-dev` command there to copy
  the built files from your cloned copy of Gatsby. For more detailed instructions
  see the [gatsby-dev-cli README](/packages/gatsby-dev-cli/)
* Add tests and code for your changes.
* Once you're done, make sure all tests still pass: `npm test`
* Commit and push to your fork.
* Create an pull request from your branch.

This project uses [FlowType](https://flowtype.org/) for static type checking.
