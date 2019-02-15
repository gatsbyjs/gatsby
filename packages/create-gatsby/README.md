# create-gatsby

A utility that invokes [`gatsby-cli`][gatsby-cli] (that's it!). This exists simply to forward any arguments and commands to gatsby-cli in a specific context, e.g. when invoked with `npm init gatsby`

This should _never_ be used in place of `gatsby-cli`, but rather should be used only in conjunction with `npm init` (see [Usage below](#usage)).

## Usage

All options, commands, etc. should be referenced from [`gatsby-cli`][gatsby-cli], however the most general use case will be creating a new gatsby project, like so:

```shell
npm init gatsby new my-great-app
```

See: [`npm init`](https://docs.npmjs.com/cli/init) documentation for more info.

[gatsby-cli]: (https://www.gatsbyjs.org/docs/gatsby-cli/)
