---
title: Using Prettier With Gatsby
---

Prettier is an opinionated code formatter that auto-formats files commonly used with Gatsby. This makes your code more readable without long lists of stylistic comments polluting PR reviews, or, worse, team conflict over the right way to format code.

Prettier formats JSX, CSS and variants (including Sass and styled-components), and Markdown (including MDX), all of which are commonly used on Gatsby sites.

## Get started with Prettier

There are two different ways to install Prettier. First if you are starting a new project (perhaps to test it out)

### Method 1: Set up with new project

Setup method 1: Start a new project by installing an official starter

All official Gatsby starters come with Prettier installed.

```sh
gatsby new my-default-starter https://github.com/gatsbyjs/gatsby-starter-default
```

## Method 2: Add Prettier to your existing project

From the root of your project, install Prettier via the command line. This will not only install Prettier on your machine, it will modify your `package.json` to add Prettier to your project's setup configuration.

```
npm install --save-dev --save-exact prettier
```

Then, create an empty config file to let editors and other tooling know you are using Prettier:

```sh
echo {}> .prettierrc.json
```

## Run prettier on your project

To format all files in your Gatsby project, you can run:

```sh
npx prettier --write .
```

## Common Prettier setups

There are a variety of Prettier setups common in Gatsby projects. Some include:

- **Using Prettier along with a linter**. Linters enforce code quality rules in order to catch bugs and work well alongside Prettier. Gatsby [plays well with ESLint](/docs/eslint).
- **Enforcing Prettier standards in a project with other team members**. In order to do this, you may want to add a test that all committed code should be installed with prettier (so that non-Prettier-ified code fails CI checks), and/or add a pre-commit or post-commit hook.
- **Format only certain types of files**. Perhaps you only want to use Prettier on markdown files, for example, or files listed in a certain folder. You can use the `.prettierignore` file and [Prettier glob patterns](https://prettier.io/docs/en/cli.html#file-patterns) to select the files you want to format.

## Additional links

- [Prettier official installation guide](https://prettier.io/docs/en/install.html)
