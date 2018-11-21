---
title: Deploying to Heroku
---

You can use the [heroku buildpack static](https://github.com/heroku/heroku-buildpack-static) to handle the static files of your site.

Set the `heroku/node.js` and `heroku-buildpack-static` buildpacks on your application creating an `app.json` file on the root of your project.

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

Sometimes specifying buildpacks via the `app.json` file doesn’t work. If this is your case try to add them in the Heroku dashboard or via the CLI.

Add a `heroku-postbuild` script in your `package.json`:

```json:title=package.json
{
  "scripts": {
    "heroku-postbuild": "gatsby build"
  }
}
```

It is worth noting that, by default, creating a new project with `gatsby new <your-project-name>` creates a `package.json` with a `start` script as `npm run develop`. Without creating a Procfile to specify your commands to run for your process types, Heroku will run the web process via the `npm start` command by default. Since we've compiled our production-optimized build with `gatsby build`, the command we want to run is actually `gatsby serve`. To do this, either add the following script to your `package.json`:

```json:package.json
{
  "scripts": {
    "start": "gatsby serve --port ${PORT}"
  }
}
```

Or, create a `Procfile`:

```title=Procfile
web: gatsby serve --port ${PORT}
```

The port needs to be specified to use the Heroku dyno's runtime environment variable in order to bind to the port correctly.

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
