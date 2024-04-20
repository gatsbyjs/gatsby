# create-gatsby

Create Gatsby apps in an interactive CLI experience that does the plumbing for you.

## Quick Overview

Create a new Gatsby app by running the following command:

```shell
npm init gatsby
```

or

```shell
pnpm run create gatsby
```

It will ask you questions about what you're building, and set up a Gatsby project for you.

_Note: This package is different from `gatsby-cli`, it is intended solely to create new sites._

## Options

If you'd like to set up a minimal site without answering any prompts you can run the following command, including your chosen site directory.

```shell
pnpm run init gatsby -y <site-directory>
```

## Working on create-gatsby locally?

If you're making changes to the create-gatsby package, you can follow the steps below to test out your changes locally:

```sh
# Move into the monorepo
cd <path-to-gatsby-monorepo>

# Install dependencies and build the package
pnpm run bootstrap

# Run the create-gatsby script
node packages/create-gatsby/cli.js
```

Note that if you use the `bootstrap` script, you'll have to rebuild after each change. Alternatively, you can use the `watch` script to automatically rebuild after local changes:

```shell
# Move into the monorepo
cd <path-to-gatsby-monorepo>

# Install dependencies and build the package
pnpm run bootstrap

# Watch changes
pnpm run watch --scope=create-gatsby
```

Open another terminal window and go to a folder where you can easily delete the test projects:

```shell
cd <path-to-playground>

# Run the create-gatsby script
node <some-path>/packages/create-gatsby/cli.js
```
