# Gatsby Admin

A visual interface to configure your Gatsby site.

We have not packaged this nicely yet, so it is not installable.

## Local development

The easiest way to work on Admin locally is to develop Admin itself.

1. Make sure to have the dependencies installed by running `yarn` in the root folder
2. Start the develop process for the Admin site by running `yarn workspace gatsby-admin run develop`

> If you see eslint errors you'll need to temporarily replace all references to `___loader` with `window.___loader` in `packages/gatsby-link/index.js`.

### Using it with a local site

To try Admin with one of your sites locally, use the `gatsby-dev-cli` to copy the local versions of `gatsby`, `gatsby-cli`, `gatsby-recipes`, `gatsby-core-utils` and `gatsby-admin` into your project:

```sh
# Make sure to build the latest local versions of all packages
~/gatsby
yarn run watch

~/my-gatsby-site
$ gatsby-dev --packages gatsby gatsby-cli gatsby-recipes gatsby-core-utils gatsby-admin

# In another tab, start your site with the Admin feature flag set
~/my-gatsby-site
$ GATSBY_EXPERIMENTAL_ENABLE_ADMIN=true gatsby develop
```

Then visit `localhost:8000/\_\_\_admin and you should see Gatsby Admin for your site!
