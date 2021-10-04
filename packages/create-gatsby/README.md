# create-gatsby (alpha)

Create Gatsby apps in an interactive CLI experience that does the plumbing for you.

## Quick Overview

Create a new Gatsby app by running the following command:

```shell
npm init gatsby
```

or

```shell
yarn create gatsby
```

It will ask you questions about what you're building, and set up a Gatsby project for you.

_Note: this package is different from the Gatsby CLI, it is intended solely to create new sites._

## Options

If you'd like to set up a minimal site without answering any prompts you can run the following command, including your chosen site directory.

```
npm init gatsby -y <site-directory>
```

## Working on create-gatsby locally?

If you're making changes to the create-gatsby package, you can follow the steps below to test out your changes locally:

```sh
# Move into the create-gatsby package
cd packages/create-gatsby

# Install dependencies and build the package
yarn && yarn build

# Run the create-gatsby script
node cli.js
```

Note that if you use the `build` script, you'll have to rebuild after each change. Alternatively, you can use the `watch` script to automatically rebuild after local changes. In that case, you'll need to run `cli.js` from the top-level directory of the `gatsby` repo:

```sh
# Move into the create-gatsby package
cd packages/create-gatsby

# Install dependencies and build the package
yarn && yarn watch

# Open another terminal window and get back to the gatsby monorepo
cd <path-to-gatsby-monorepo>

# Run the create-gatsby script
node packages/create-gatsby/cli.js
```
