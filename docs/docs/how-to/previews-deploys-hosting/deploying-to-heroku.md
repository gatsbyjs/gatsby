---
title: Deploying to Heroku
---

You can use the [heroku buildpack static](https://github.com/heroku/heroku-buildpack-static) to handle the static files of your site.

Set the `heroku/node.js` and `heroku-buildpack-static` buildpacks on your application.

```shell
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
```

You can optionally add the buildpacks to `app.json` if you want to take advantage of the [heroku platform API](https://devcenter.heroku.com/articles/setting-up-apps-using-the-heroku-platform-api)

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

The following configuration will give you a good start point in line with Gatsby's [suggested approach to caching](/docs/caching/).

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
  "https_only": true,
  "error_page": "404.html"
}
```
