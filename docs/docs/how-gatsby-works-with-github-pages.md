---
title: How Gatsby Works with GitHub Pages
---

The easiest way to push a gatsby app to github pages is using a package called `gh-pages`.

`yarn add --dev gh-pages`

## GitHub repository page

Add a `deploy` script to `package.json`

```
    {
        scripts: {
            "deploy": "gatsby build --prefix-paths && gh-pages -d public",
        }
    }
```

We are using prefix paths because our website is inside a folder `http://username.github.io/reponame/` so we need to add pathPrefix to `gatsby-config.js`

```
{
    pathPrefix: "/reponame"
}
```

When you run `yarn run deploy` all contents of `public` folder will be moved to your repositorys `gh-pages` branch.

## GitHub Organization or User page

First thing is to create a repository which should be named `username.github.io`.

In this case we dont need to specify `pathPrefix`, but our website needs to be pushed to `master` branch.

```
    {
        scripts: {
            ...
            "deploy": "gatsby build && gh-pages -d public -b master",
        }
    }
```

After running `yarn run deploy` you should see your website at `http://username.github.io`
