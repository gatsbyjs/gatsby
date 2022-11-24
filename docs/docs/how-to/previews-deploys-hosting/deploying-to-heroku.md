---
title: Deploying to Heroku
---

[Heroku](https://www.heroku.com/) is a cloud platform as a service (PaaS) supporting several programming languages.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- A Heroku account
- The [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed

## Instructions

You can use the [Heroku buildpack static](https://github.com/heroku/heroku-buildpack-static) to handle the static files of your site.

Set the `heroku/node.js` and `heroku-buildpack-static` buildpacks on your application.

```shell
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
```

You can optionally add the buildpacks to `app.json` if you want to take advantage of the [Heroku platform API](https://devcenter.heroku.com/articles/setting-up-apps-using-the-heroku-platform-api)

```json:title=app.json
{
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    },
    {
      "url": "https://github.com/heroku/heroku-buildpack-static"
    }
  ]
}
```

Heroku will automatically detect and run the `build` script from your `package.json` which should already look like this:

```json:title=package.json
{
  "scripts": {
    "build": "gatsby build"
  }
}
```

Finally, add a `static.json` file in the root of your project to define the directory where your static assets will be. You can check all the options for this file in the [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static#configuration) configuration.

The following configuration will give you a good start point in line with Gatsby's [suggested approach to caching](/docs/how-to/previews-deploys-hosting/caching/).

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
    "sw.js": {
      "Cache-Control": "public, max-age=0, must-revalidate"
    },
    "page-data/**": {
      "Cache-Control": "public, max-age=0, must-revalidate"
    },
  },
  "https_only": true,
  "error_page": "404.html"
}
```

## Limitations

Heroku doesn't support advanced features like [SSR](/docs/how-to/rendering-options/using-server-side-rendering/), [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/), or [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn). You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup).
