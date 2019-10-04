# gatsbyjs.org

The main Gatsby site at gatsbyjs.org

Run locally with:

- `yarn install`
- `npm run develop`

See the full contributing instructions at https://www.gatsbyjs.org/contributing/how-to-contribute/.

## Environment variables

To work with environment variables create a file in the root of `www` called `.env.development`.

The `.env.development` file is ignored by git. Your token should never be committed.

### Working with the starter library

To develop on the starter library, you'll need to supply a GitHub personal access token.

1. Create a personal access token in your GitHub [Developer settings](https://github.com/settings/tokens).
2. In the new token's settings, grant that token the "public_repo" scope.
3. Add the GitHub token to the `.env.development` file:

```
GITHUB_API_TOKEN=YOUR_TOKEN_HERE
```

### Enabling guess.js

Guess.js is disabled by default and can be enabled by setting `ANALYTICS_SERVICE_ACCOUNT` and `ANALYTICS_SERVICE_ACCOUNT_KEY` env variables. These variables need to have access to the gatsbyjs.org analytics.

If you have access to the keys, add them like so:

```
ANALYTICS_SERVICE_ACCOUNT="service account@email.com"
ANALYTICS_SERVICE_ACCOUNT_KEY="PEM KEY VALUE"
```

## Running slow build? (Screenshots placeholder)

If you are not working on starter or site showcase, it might be beneficial to use a placeholder image instead of actual screenshots. It will skip downloading screenshots and generating responsive images for all screenshots and replace them with a placeholder image.

Add the following env variable to your `.env.development` file to enable placeholder behaviour:

```
GATSBY_SCREENSHOT_PLACEHOLDER=true
```

For more information checkout [`gatsby-transformer-screenshot` docs](http://www.gatsbyjs.org/packages/gatsby-transformer-screenshot#placeholder-image).

## Design tokens

Please make use of the design tokens available in `src/utils/presets` when adding or modifying component CSS styles. You can find a work-in-progress documentation of these tokens at https://www.gatsbyjs.org/guidelines/design-tokens/ (and on some of the sibling pages documenting color and typography).
