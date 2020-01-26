# gatsbyjs.org

The main Gatsby site at gatsbyjs.org

Run locally with:

- `yarn install`
- `gatsby develop`

See the full contributing instructions at https://www.gatsbyjs.org/contributing/how-to-contribute/

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

### Enabling guess.js

Guess.js is disabled by default and can be enabled by setting `ANALYTICS_SERVICE_ACCOUNT` and `ANALYTICS_SERVICE_ACCOUNT_KEY` env variables. These variables need to have access to the gatsbyjs.org analytics.

If you have access to the keys, add them like so:

```shell
ANALYTICS_SERVICE_ACCOUNT="service account@email.com"
ANALYTICS_SERVICE_ACCOUNT_KEY="PEM KEY VALUE"
```

### Enabling localizations

Localizations are currently a work-in-progress and are thus disabled by default. They can be enabled by setting the `ENABLE_LOCALIZATIONS` env variable:

```shell
ENABLE_LOCALIZATIONS=true
```

There is currently no UI to link to the localizations, so you'll have to type in the name of the file you want to go to using the language code (e.g. /es/tutorial/part-one).

## Running slow build? (Screenshots placeholder)

If you are not working on a starter or site showcase, it might be beneficial to use a placeholder image instead of actual screenshots. It will skip downloading screenshots and generating responsive images for all screenshots and replace them with a placeholder image.

Add the following env variable to your `.env.development` file to enable placeholder behaviour:

```shell
GATSBY_SCREENSHOT_PLACEHOLDER=true
```

For more information checkout [`gatsby-transformer-screenshot` docs](https://www.gatsbyjs.org/packages/gatsby-transformer-screenshot#placeholder-image).

## `theme-ui`, CSS authoring, and dark mode

Since [#18027](https://github.com/gatsbyjs/gatsby/pull/18027), we are using [`theme-ui`](https://theme-ui.com/) (via [`gatsby-plugin-theme-ui`](https://www.gatsbyjs.org/packages/gatsby-plugin-theme-ui/?=gatsby-plugin-theme)) to handle theming, CSS authoring, and to provide a dark color mode.

- Please use the [`sx` prop](https://theme-ui.com/sx-prop) and theme values to style elements and components wherever possible. The prop is "enabled" by adding `theme-ui`'s [JSX pragma](https://theme-ui.com/jsx-pragma).
- It is still okay to directly import tokens, e.g. `mediaQueries` or `colors` directly from `www/src/gatsby-plugin-theme-ui` if it helps your specific use case — for example when global CSS is required, when passing theme values to other libraries or plugins, when authoring complex responsive styles, etc.
- It also is perfectly fine to follow the [`theme-ui` approach for responsive styles](https://theme-ui.com/getting-started/#responsive-styles)!
- If you need to add fields to the [theme](https://theme-ui.com/theme-spec), you can do so in (the work-in-progress) `www/src/gatsby-plugin-theme-ui`. As things settle down, we will eventually migrate changed and added role-based tokens to https://www.npmjs.com/package/gatsby-design-tokens.
- Please keep the dark mode in mind when editing existing or adding new components.
- Please bear with us while we adjust https://www.gatsbyjs.org/guidelines/design-tokens/ to document the `theme-ui` values next to the raw token values.
