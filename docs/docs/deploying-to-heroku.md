---
title: Deploying to Heroku
---

You can use the [heroku buildpack static](https://github.com/heroku/heroku-buildpack-static) to handle the static files of your site.

Set the `heroku/node.js` and `heroku-buildpack-static` buildpacks on your application creating an `app.json` file on the root of your project.

app.json:

```
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

Sometimes specifying buildpacks via the `app.json` file doesn’t work. If this is your case try to add them in the Heroku dashboard or via the CLI.

Add a `heroku-postbuild` script in your `package.json`:

package.json:

```
{
  // ...
  "scripts": {
    // ...
    "heroku-postbuild": "gatsby build"
    // ...
  }
  // ...
}
```

Finally, add a `static.json` file in the root of your project to define the directory where your static assets will be. You can check all the options for this file in the [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static#configuration) configuration.

```
{
  "root": "public/",
  "headers": {
    "/**.js": {
      "Cache-Control": "public, max-age=0, must-revalidate"
    }
  }
}
```
