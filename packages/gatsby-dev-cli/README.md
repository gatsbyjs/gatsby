# gatsby-dev-cli

A command-line tool for local Gatsby development. When doing development work
on Gatsby core, this tool allows you to easily copy the changes to the various
Gatsby packages to Gatsby sites that you're testing your changes on.

## Install

`npm install -g gatsby-dev-cli@canary`

or

`yarn global add gatsby-dev-cli@canary`

## Configuration / First time setup

The gatsby-dev-cli tool needs to know where your cloned Gatsby repository is
located. You typically only need to configure this once.

`gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby`

## How to use

Navigate to the project you want to link to your forked Gatsby repository and
run:

`gatsby-dev`

The tool will then scan your project's package.json to find its Gatsby
dependencies and copy the latest source from your cloned version of Gatsby into
your project's node_modules folder. A watch task is then created to re-copy any
modules that might change while you're working on the code, so you can leave
this program running.

Typically you'll also want to run `npm run watch` in the Gatsby repo to set up
watchers to build Gatsby source code.
