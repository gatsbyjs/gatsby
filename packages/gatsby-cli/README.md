# gatsby-cli

Gatsby command line tool.

Let's you create new Gatsby sites using
[Gatsby starters](https://www.gatsbyjs.org/docs/gatsby-starters/).

It also let's you run commands on sites. The tool runs code from the `gatsby`
package installed locally.

## Install

`npm install --global gatsby-cli`

## How to use

Run `gatsby --help` for full help.

### New

`gatsby new gatsby-site`

See the [Gatsby starters docs](https://www.gatsbyjs.org/docs/gatsby-starters/)
for more.

### Develop

At the root of a Gatsby site run `gatsby develop` to start the Gatsby
development server.

Options

```
  -H, --host    Set host. Defaults to localhost
  -p, --port    Set port. Defaults to 8000
  -o, --open    Open the site in your browser for you
  -S, --https   Use HTTPS
```

Follow the [Local HTTPS guide](https://www.gatsbyjs.org/docs/local-https/)
to find out how you can set up an HTTPS development server using Gatsby.

### Build

At the root of a Gatsby site run `gatsby build` to do a production build of a
site.

### Serve

At the root of a Gatsby site run `gatsby serve` to serve the production build of
the site for testing.

### Info

At the root of a Gatsby site run `gatsby info` to get helpful environment information which will be required when reporting a bug.
