---
title: Deploying to Dokku
---

Deploying Gatsby to Dokku is very similar to [Deploying to Heroku](/docs/deploying-to-heroku), with a few minor changes.

As with deploying to Heroku, you will need both the [nodejs](https://github.com/heroku/heroku-buildpack-nodejs.git) and [static](https://github.com/heroku/heroku-buildpack-static) buildpacks. Unlike for Heroku, this is done with a `.buildpacks` file. In your project's root directory, create the file with the following contents:

```text:title=.buildpacks
https://github.com/heroku/heroku-buildpack-nodejs.git
https://github.com/heroku/heroku-buildpack-static.git
```

The rest of the steps are identical to Heroku's instructions. In particular, make sure that you have a `build` or `heroku-post-build` so that Dokku builds your site before deploying. See [Customizing the build process](https://devcenter.heroku.com/articles/nodejs-support#customizing-the-build-process) for more details.

```json:title=package.json
{
  "scripts": {
    "build": "gatsby build"
  }
}
```

Similarly, create a `static.json` file in your project's root directory according to the [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static#configuration) configuration documentaion. For example:

```json:title=static.json
{
  "root": "public/",
  "headers": {
    "/**": {
      "Cache-Control": "public, max-age=0, must-revalidate"
    },
    "/**.css": {
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    "/**.js": {
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    "/static/**": {
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    "/icons/*.png": {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  },
  "error_page": "404.html"
}
```
