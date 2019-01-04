# gatsbyjs.org

The main Gatsby site at gatsbyjs.org

Run locally with:

- `yarn install`
- `gatsby develop`

See the full contributing instructions at https://www.gatsbyjs.org/docs/how-to-contribute/.

## Working with the starter showcase

To develop on the starter showcase, you'll need to supply a GitHub personal access token.

1. Create a personal access token in your GitHub [Developer settings](https://github.com/settings/tokens).
2. In the new token's settings, grant that token the "public_repo" scope.
3. Create a file in the root of `www` called `.env.development`, and add the token to that file like so:

```
GITHUB_API_TOKEN=YOUR_TOKEN_HERE
```

The `.env.development` file is ignored by git. Your token should never be committed.

## Running slow build? (Screenshots placeholder)

If you are not working on starter or site showcase, it might be beneficial to use a placeholder image instead of actual screenshots. It will skip downloading screenshots and generating responsive images for all screenshots and replace them with a placeholder image.

Add the following env variable to your `.env.development` file to enable placeholder behaviour:

```
GATSBY_SCREENSHOT_PLACEHOLDER=true
```

For more information checkout [`gatsby-transformer-screenshot` docs](http://www.gatsbyjs.org/packages/gatsby-transformer-screenshot#placeholder-image).
