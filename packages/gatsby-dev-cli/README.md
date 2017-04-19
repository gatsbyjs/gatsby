# gatsby-dev-cli

A commandline tool for local Gatsby development. When doing development work on the Gatsby core this tool allows you to easily update any project that has depencies on packages from Gatsby, like a site you are working on.


## Install

```bash
$ npm install -g gatsby-dev-cli@canary
```

or

```bash
$ yarn global add gatsby-dev-cli@canary
```

## Configuration / First time setup

The gatsby-dev-cli tool needs to know where your cloned Gatsby repository is located. You typically only need to configure this once.

```
$ gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby
```

## How to use

Navigate to the project you want to link to your forked Gatsby repository and run:

```bash
$ gatsby-dev
```

The tool will then scan your project's package.json to find any Gatsby dependencies and copy them into your project's node_modules folder. A watch task is then created to re-copy any modules that might change while you're working on the code, so you can leave this program running.

### Repo without gatby dependencies

You can prevent the automatic depencencies scan and instead specify a list of packages you want to link by using the `--packages` option:

```bash
$ gatsby-dev --packages gatsby gatsby-typegen-remark
```
