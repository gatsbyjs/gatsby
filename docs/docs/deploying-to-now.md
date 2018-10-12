---
title: Deploying to Now
---

In order to deploy your Gatsby project using [Now](https://zeit.co/now), you can do the following:

1.  Install the Now CLI

`npm install -g now`

2.  Install a node server package (such as `serve`, or `http-server`)

`npm install --save serve`

3.  Add a `start` script to your `package.json` file, this is what Now will use to run your application:

```json:title=package.json
{
  "scripts": {
    "start": "serve public/"
  }
}
```

4.  Run `now` at the root of your Gatsby project, this will upload your project, run the `build` script, and then your `start` script.
