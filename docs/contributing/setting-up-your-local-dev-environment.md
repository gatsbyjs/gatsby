---
title: Setting Up Your Local Dev Environment
---

Gatsby uses a "monorepo" pattern to manage its many dependencies and relies on
[Lerna](https://lernajs.io/) and [Yarn](https://yarnpkg.com/en/) to configure the repository for both active development and documentation infrastructure changes.

## Using Yarn

Yarn is a package manager for your code, similar to [NPM](https://www.npmjs.com/). While NPM is used to develop Gatsby sites with the CLI, contributing to the Gatsby repo requires Yarn for the following reason: we use Yarn's [workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) feature that comes really handy for monorepos. It allows us to install dependencies from multiple `package.json` files in sub-folders, enabling a faster and lighter installation process.

```json:title=package.json
{
  "workspaces": ["workspace-a", "workspace-b"]
}
```

## Gatsby repo install instructions

- [Install](https://yarnpkg.com/en/docs/install) the Yarn package manager.
- Ensure you have the latest version of Yarn installed (>= 1.0.2). `yarn --version`
- Fork the [official repository](https://github.com/gatsbyjs/gatsby).
- Clone your fork: `git clone --depth=1 https://github.com/<your-username>/gatsby.git`
- Set up repo and install dependencies: `yarn run bootstrap`
- Make sure tests are passing for you: `yarn test`
- Create a topic branch: `git checkout -b topics/new-feature-name`
- See [docs setup instructions](#docs-site-setup-instructions) below for docs-only changes.
- Run `yarn run watch` from the root of the repo to watch for changes to packages' source code and compile these changes on-the-fly as you work. Note that the watch command can be resource intensive. To limit it to the packages you're working on, add a scope flag, like `yarn run watch -- --scope={gatsby,gatsby-cli}`. To watch just one package, run `yarn run watch -- --scope=gatsby`.
- Install [gatsby-dev-cli](/packages/gatsby-dev-cli/) globally: `yarn global add gatsby-dev-cli`
- Run `yarn install` in each of the sites you're testing.
- For each of your Gatsby test sites, run the `gatsby-dev` command inside the test site's directory to copy
  the built files from your cloned copy of Gatsby. It'll watch for your changes
  to Gatsby packages and copy them into the site. For more detailed instructions
  see the [gatsby-dev-cli README](/packages/gatsby-dev-cli/) and check out the [gatsby-dev-cli demo video](https://www.youtube.com/watch?v=D0SwX1MSuas).
  Note: if you plan to modify packages that are exported from `gatsby` directly, you need to either add those manually to your test sites so that they are listed in `package.json` (e.g. `yarn add gatsby-link`), or specify them explicitly with `gatsby-dev --packages gatsby-link`).
- Add tests and code for your changes.
- Once you're done, make sure all tests still pass: `yarn test`.
- Commit and push to your fork.
- Create a pull request from your branch.

### Docs site setup instructions

After going through the development setup instructions above, there are a few additional things that are helpful to know when setting up the [Gatsby.js docs site](https://gatsbyjs.org/docs/). which mostly lives in the [www](https://github.com/gatsbyjs/gatsby/tree/master/www) directory.

- Clone the Gatsby repo as described above.
- For docs-only changes, consider using `git checkout -b docs/some-change` or `git checkout -b docs-some-change`, as this will short circuit the CI process and only run linting tasks.
- Change directories into the docs site folder: `cd www`
- Install dependencies with Yarn: `yarn install`
- Add the following env variable to an `.env.development` file to [enable image placeholders](https://github.com/gatsbyjs/gatsby/tree/master/www#running-slow-build-screenshots-placeholder): `GATSBY_SCREENSHOT_PLACEHOLDER=true`. This will speed up building the docs site significantly!
- Start a build of `www` with `gatsby develop`.
- Edit Markdown files in the [docs](https://github.com/gatsbyjs/gatsby/tree/master/docs) and [contributing](https://github.com/gatsbyjs/gatsby/tree/master/contributing) folders, as well as the [YAML sidebar files](https://github.com/gatsbyjs/gatsby/tree/master/www/src/data/sidebars).
- View the changes in your browser at `http://localhost:8000`.
- Commit your changes and submit a pull request!
