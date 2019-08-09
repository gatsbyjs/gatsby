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

The `--prefix-paths` flag is used because your website is inside a folder like `http://username.github.io/reponame/`. You'll need to add your `/reponame` path prefix as an option to `gatsby-config.js`:

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

## Enabling GitHub Pages to publish your site from master or gh-pages

To select master or gh-pages as your publishing source, you must have the branch present in your repository. If you don't have a master or gh-pages branch, you can create them and then return to source settings to change your publishing source.

1. On GitHub, navigate to your GitHub Pages site's repository.

2. Under your repository name, click Settings.

3. Use the Select source drop-down menu to select master or gh-pages as your GitHub Pages publishing source.

4. Click Save.

## Publishing your GitHub Pages site from a /docs folder on your master branch

To publish your site's source files from a /docs folder on your master branch, you must have a master branch and your repository must:

- Have a /docs folder in the root of the repository
- Not follow the repository naming scheme <username>.github.ioor <orgname>.github.io

Tip: If you remove the /docs folder from the master branch after it's enabled, your site won't build and you'll get a page build error message for a missing /docs folder.

1. On GitHub, navigate to your GitHub Pages site's repository.

2. Create a folder in the root of your repository on the master branch called /docs.

3. Under your repository name, click Settings.

4. Use the Select source drop-down menu to select master branch /docs folder as your GitHub Pages publishing source.

5. Click Save.

Tip: The master branch /docs folder source setting will not appear as an option if the /docs folder doesn't exist on the master branch.
