---
title: How Gatsby Works with GitHub Pages
---

GitHub pages is a service offered by GitHub that allows hosting for websites configured straight from the repository. A Gatsby site can be hosted on GitHub pages with just a few configurations to the codebase and the repository's settings.

You can publish your site on GitHub pages several different ways:

- to a path like `username.github.io/reponame/` or `/docs`
- to a subdomain based on your username or organization name: `username.github.io` or `orgname.github.io`
- to the root subdomain at `username.github.io`, and then configured to use a custom domain

## Configuring the GitHub Pages source branch

You must select which branch will be deployed from your repository settings in GitHub for GitHub pages to function. On GitHub:

1. Navigate to your site's repository.

2. Under the repository name, click Settings.

3. In the GitHub Pages section, use the Source drop-down to select master (for publishing to the root subdomain) or gh-pages (for publishing to a path like `/docs`) as your GitHub Pages publishing source.

4. Click Save.

## Installing the `gh-pages` package

The easiest way to push a Gatsby app to GitHub Pages is by using a package called [gh-pages](https://github.com/tschaub/gh-pages).

```shell
npm install gh-pages --save-dev
```

## Using a deploy script

A custom script in your `package.json` makes it easier to build your site and move the contents of the built files to the proper branch for GitHub pages, this helps automate that process.

### Deploying to a path on GitHub pages

For sites deployed at a path like `username.github.io/reponame/`, the `--prefix-paths` flag is used because your website will end up inside a folder like `username.github.io/reponame/`. You'll need to add your `/reponame` [path prefix](/docs/path-prefix/) as an option to `gatsby-config.js`:

```js:title=gatsby-config.js
module.exports = {
  pathPrefix: "/reponame",
}
```

Then add a `deploy` script to `package.json` in your repository's codebase:

```json:title=package.json
{
  "scripts": {
    "deploy": "gatsby build --prefix-paths && gh-pages -d public"
  }
}
```

When you run `npm run deploy` all contents of the `public` folder will be moved to your repository's `gh-pages` branch. Make sure that your repository's settings has the `gh-pages` branch set as the source to deploy from.

**Note**: to select master or gh-pages as your publishing source, you must have the branch present in your repository. If you don't have a master or gh-pages branch, you can create them and then return to source settings to change your publishing source.

### Deploying to a GitHub pages subdomain at github.io

For a repository named like `username.github.io`, you don't need to specify `pathPrefix` and your website needs to be pushed to the `master` branch.

```json:title=package.json
{
  "scripts": {
    "deploy": "gatsby build && gh-pages -d public -b master"
  }
}
```

After running `npm run deploy` you should see your website at `username.github.io`

### Deploying to the root subdomain and using a custom domain

If you use a [custom domain](https://help.github.com/articles/using-a-custom-domain-with-github-pages/), don't add a `pathPrefix` as it will break navigation on your site. Path prefixing is only necessary when the site is _not_ at the root of the domain like with repository sites.

**Note**: Don't forget to add your [CNAME](https://help.github.com/articles/troubleshooting-custom-domains/#github-repository-setup-errors) file to the `static` directory.
