---
title: Deploying to Heroku
---

You can use the [heroku buildpack static](https://github.com/heroku/heroku-buildpack-static) to handle the static files of your site.

Set the `heroku/node.js` and `heroku-buildpack-static` buildpacks on your application.

```shell
$ heroku buildpacks:set heroku/nodejs
$ heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
```

You can optionally add the buildpacks to `app.json` if you want to take advantage of the [heroku platform api](https://devcenter.heroku.com/articles/setting-up-apps-using-the-heroku-platform-api)

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

Add a `heroku-postbuild` script in your `package.json`:

```json:title=package.json
{
  "scripts": {
    "heroku-postbuild": "gatsby build"
  }
}
```

Finally, add a `static.json` file in the root of your project to define the directory where your static assets will be. You can check all the options for this file in the [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static#configuration) configuration.

```json:title=static.json
{
  "root": "public/",
  "headers": {
    "/**.js": {
      "Cache-Control": "public, max-age=0, must-revalidate"
    }
  }
}
```
