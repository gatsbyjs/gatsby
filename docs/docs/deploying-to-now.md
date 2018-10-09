---
title: Deploying to Now
---

In order to deploy your Gatsby project using [Now](https://zeit.co/now), depending on how big your project is, you can do the following:

### If your site has few pages
1.  Install the Now CLI

`npm install -g now`

2.  Run `gatsby build` at the root of your Gatsby project

3. Then run `now ./public` at the root of your Gatsby project

Simply, you can write a npm script `deploy: "gatsby build && now ./public"`

### If your project size is big and includes many pages
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
