# gatsbyjs.org (Currently deprecated)

Until the unification of gatsbyjs.org and gatsbyjs.com (see the [blogpost announcing the change](https://www.gatsbyjs.com/blog/announcing-unified-gatsby/)) the `www` portion of this monorepo contained the complete code for gatsbyjs.org.

The code for gatsbyjs.com is not open-source at the moment and therefore this portion of the monorepo will exist for archival reasons. While you're still able to run this site and its contents, it doesn't represent the current/latest version of the website.

The plan is to open-source parts of gatsbyjs.com (the previous gatsbyjs.org parts) again but we don't have any ETA on this yet.

---

**Below you can see the (old) instructions to run the site:**

Run locally with:

- `yarn install`
- `gatsby develop`

See the full contributing instructions in the [documentation](https://www.gatsbyjs.com/contributing/how-to-contribute/).

## Environment variables

To work with environment variables create a file in the root of `www` called `.env.development`.

The `.env.development` file is ignored by git. Your token should never be committed.

### Working with the starter library

To develop on the starter library, you'll need to supply a GitHub personal access token.

1. Create a personal access token in your GitHub [Developer settings](https://github.com/settings/tokens).
2. In the new token's settings, grant that token the "public_repo" scope.
3. Add the GitHub token to the `.env.development` file:

```shell
GITHUB_API_TOKEN=YOUR_TOKEN_HERE
```

_Note:_ For `gatsby build` to be able to run you also need a `.env.production` file with the same contents

### Enabling localizations

Localizations are currently a work-in-progress and are thus disabled by default. They can be enabled by setting the `LOCALES` env variable to the locales you want to build:

```shell
LOCALES="es ja id pt-BR zh-Hans"
```

The list of possible locales can be found at [i18n.json](/www/i18n.json).

The default locale, English, is always on. There is currently no UI to link to the localizations, so you'll have to type in the name of the file you want to go to using the language code (e.g. /es/tutorial/part-one).

## Running slow build?

### Disabling NPM search (plugins/packages)

If you are not working with plugins/packages, you can add the following variable to `.env.development`:

```shell
DISABLE_NPM_SEARCH=true
```

This will tell the plugin `gatsby-transformer-npm-package-search` to not search gatsby-related packages, and instead only search for a placeholder keyword.

### Screenshots placeholder

If you are not working on a starter or site showcase, it might be beneficial to use a placeholder image instead of actual screenshots. It will skip downloading screenshots and generating responsive images for all screenshots and replace them with a placeholder image.

Add the following env variable to your `.env.development` file to enable placeholder behaviour:

```shell
GATSBY_SCREENSHOT_PLACEHOLDER=true
```

For more information checkout [`gatsby-transformer-screenshot` docs](https://www.gatsbyjs.com/plugins/gatsby-transformer-screenshot#placeholder-image).
