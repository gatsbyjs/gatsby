# gatsbyjs.org

The main Gatsby site at gatsbyjs.org

Run locally with:

- `yarn install`
- `gatsby develop`

See the full contributing instructions at https://www.gatsbyjs.org/docs/how-to-contribute/.

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

### Working with feedback widgets

Several areas of the site include feedback widgets (currently starter library and plugin library). These aren't configured to work in development, unless you have set the public keys (as environment variables) for each widget.

If you have access to the keys, add them like so:

```
GATSBY_FEEDBACK_KEY_PLUGINLIB=ADD_KEY
GATSBY_FEEDBACK_KEY_STARTERLIB=ADD_KEY
```

If there's a problem with the feedback widgets, please open an issue in the repo.

## Running slow build? (Screenshots placeholder)

If you are not working on starter or site showcase, it might be beneficial to use a placeholder image instead of actual screenshots. It will skip downloading screenshots and generating responsive images for all screenshots and replace them with a placeholder image.

Add the following env variable to your `.env.development` file to enable placeholder behaviour:

```
GATSBY_SCREENSHOT_PLACEHOLDER=true
```

For more information checkout [`gatsby-transformer-screenshot` docs](http://www.gatsbyjs.org/packages/gatsby-transformer-screenshot#placeholder-image).
