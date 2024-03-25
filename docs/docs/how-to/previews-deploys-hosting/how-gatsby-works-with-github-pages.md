---
title: How Gatsby Works with GitHub Pages
---

[GitHub Pages](https://pages.github.com/) is a service offered by GitHub that allows hosting for websites configured straight from the repository. A Gatsby site can be hosted on GitHub Pages with a few configurations to the codebase and the repository's settings.

You can publish your site on GitHub Pages several different ways:

- to a path like `username.github.io/reponame/` or `/docs`
- to a subdomain based on your username or organization name: `username.github.io` or `orgname.github.io`
- to the root subdomain at `username.github.io`, and then configured to use a custom domain

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- A GitHub account

## General instructions

### Configuring the GitHub Pages source branch

You must select which branch will be deployed from your repository settings in GitHub for GitHub Pages to function. On GitHub:

1. Navigate to your site's repository.
1. Under the repository name, click **"Settings"**.
1. In the GitHub Pages section, use the **"Source"** drop-down to select `main` (for publishing to the root subdomain) or `gh-pages` (for publishing to a path like `/docs`) as your GitHub Pages publishing source.
1. Click **"Save"**.

### Installing the `gh-pages` package

The best way to push a Gatsby app to GitHub Pages is by using a package called [gh-pages](https://github.com/tschaub/gh-pages).

```shell
npm install gh-pages --save-dev
```

### Using a deploy script

You can add a custom `deploy` script to the `"scripts"` section of your `package.json`. This will make it easier to publish your Gatsby site to GitHub pages. See the instructions below how to configure it (as it depends on what option you'll choose).

## Specific instructions

### Deploying to a path with pathPrefix

For sites deployed at a path like `username.github.io/reponame/`, the `--prefix-paths` flag is used because your website will end up inside a folder like `username.github.io/reponame/`. You'll need to add your `/reponame` [path prefix](/docs/how-to/previews-deploys-hosting/path-prefix/) as an option to `gatsby-config.js`:

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

When you run `npm run deploy` in your `main` branch all contents of the `public` folder will be moved to your repository's `gh-pages` branch. Make sure that your repository's settings has the `gh-pages` branch set as the source to deploy from.

**Note**: To select `main` or `gh-pages` as your publishing source, you must have the branch present in your repository. If you don't have a `main` or `gh-pages` branch, you can create them and then return to source settings to change your publishing source.

> ⚠️ As your repository will grow and get more commits, so will your `gh-pages` branch. This might slow down operations like clone and increase disk usage. To address this, use the `-f` option from the `gh-pages` command to avoid keeping an history of the GitHub Pages branch.

### Deploying to a GitHub Pages subdomain at github.io

For a repository named like `username.github.io`, you don't need to specify `pathPrefix` and your website needs to be pushed to the `main` branch.

> ⚠️ Keep in mind that GitHub Pages forces deployment of user/organization pages to the `main` branch. So if you use `main` for development you need to do one of these:
>
> - Change the default branch from `main` to something else, and use `main` as a site deployment directory only:
>   1. To create a new branch called `source` run this command:
>      `git checkout -b source main`
>   2. Change the default branch in your repository settings ("Branches" menu item) from `main` to `source`
> - **Note**: GitHub Pages lets you use any branch for deployment, see [this docs page](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#choosing-a-publishing-source) on how to do this. This means you do not necessarily have to change your default branch.
> - Have a separate repository for your source code (so `username.github.io` is used only for deployment and not really for tracking your source code). If you go down this route, you will need to add an extra option for `--repo <repo>` (works for https and git urls) in the gh-pages command below.

```json:title=package.json
{
  "scripts": {
    "deploy": "gatsby build && gh-pages -d public -b main"
  }
}
```

> If you are deploying to branch different to `main`, replace it with your deployment branch's name in the deploy script.

After running `npm run deploy` you should see your website at `username.github.io`

### Deploying to the root subdomain and using a custom domain

If you use a [custom domain](https://help.github.com/articles/using-a-custom-domain-with-github-pages/), don't add a `pathPrefix` as it will break navigation on your site. Path prefixing is only necessary when the site is _not_ at the root of the domain like with repository sites.

**Note**: Don't forget to add your [CNAME](https://help.github.com/articles/troubleshooting-custom-domains/#github-repository-setup-errors) file to the `static` directory.

### GitHub Actions

You can use GitHub actions to push your Gatsby site to GitHub Pages. See the [Gatsby Publish Action](https://github.com/marketplace/actions/gatsby-publish) for more information.

## Limitations

GitHub Pages doesn't support advanced features like [SSR](/docs/how-to/rendering-options/using-server-side-rendering/), [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/), or [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn). You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup).
