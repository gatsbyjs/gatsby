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
