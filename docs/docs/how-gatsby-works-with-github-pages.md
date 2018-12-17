---
title: How Gatsby Works with GitHub Pages
---

The easiest way to push a Gatsby app to GitHub Pages is by using a package called [gh-pages](https://github.com/tschaub/gh-pages).

`npm install gh-pages --save-dev`

## GitHub repository page

Add a `deploy` script to `package.json`

```json:title=package.json
{
  "scripts": {
    "deploy": "gatsby build --prefix-paths && gh-pages -d public"
  }
}
```

The `--prefix-paths` flag is used because your website is inside a folder like `http://username.github.io/reponame/`, you'll need to add your `/reponame` path prefix as an option to `gatsby-config.js`:

```js:title=gatsby-config.js
module.exports = {
  pathPrefix: "/reponame",
}
```

When you run `npm run deploy` all contents of the `public` folder will be moved to your repository's `gh-pages` branch. Make sure that your repository's settings has the `gh-pages` branch set as the source.

## GitHub Organization or User page

Create a repository named like `username.github.io`.

**Note**: In this case you don't need to specify `pathPrefix` and your website needs to be pushed to `master` branch.

```json:title=package.json
    {
        "scripts": {
            ...
            "deploy": "gatsby build && gh-pages -d public -b master",
        }
    }
```

After running `npm run deploy` you should see your website at `http://username.github.io`

## Custom domains

If you use a [custom domain](https://help.github.com/articles/using-a-custom-domain-with-github-pages/), don't add a `pathPrefix` as it will break navigation on your site. Path prefixing is only necessary when the site is _not_ at the root of the domain like with repository sites.

**Note**: Don't forget to add your [CNAME](https://help.github.com/articles/troubleshooting-custom-domains/#github-repository-setup-errors) file to the `static` directory.
