---
title: "Deploying Gatsby"
---

## Tutorials for deploying on different static site hosts

* [S3/Cloudfront](/docs/deploy-gatsby/#amazon-s3-and-cloudfront)
* [Github Pages](/docs/deploy-gatsby/#github-pages)

## Amazon S3 and Cloudfront

If you decide to host your Gatsby site on S3 with Cloudfront as CDN, you should change the "Origin Domain Name" on the Cloudfront panel with the real URL of your S3 bucket: **examplewebsite.com.s3-website-eu-west-1.amazonaws.com** replacing the default URL suggested by Amazon **examplewebsite.com.s3.amazonaws.com**. 

Without this change, [S3 doesn't look for index.html files when serving "clean urls"](https://forums.aws.amazon.com/message.jspa?messageID=314454). 

## Github Pages

### Deploying a project page

You can deploy sites on Github Pages with or without a custom domain. If you choose to use the default setup (without a custom domain), you will need to setup your site with [path prefixing](/docs/path-prefix/).

### Use the NPM package `gh-pages` for deploying

First add **gh-pages** as a `devDependency` of your site and create an npm script command to **deploy** your project by running `npm install gh-pages --save-dev` or `yarn add gh-pages --dev` (if you have yarn installed).

Then add a **deploy** command in your `package.json` file.

```
"scripts": {
  "deploy": "gatsby build --prefix-paths && gh-pages -d public",
}
```

In the `gatsby-config.js`, set the `pathPrefix` to be added to your site's link paths. The `pathPrefix` should be the project name in your repository. (ex. `https://github.com/username/project-name` - your `pathPrefix` should be `/project-name`). See [the docs page on path prefixing for more](/docs/path-prefix/).

```
module.exports = {
  pathPrefix: `/project-name`,
}
```

Now run `yarn deploy` or `npm run deploy`. Preview changes in your github page `https://username.github.io/project-name/`. You also can also find the link to your site on Github under `Settings` > `Github Pages`. 

## Debugging tips

### Don't minify HTML

If you see the following error:

```
Unable to find element with ID ##
```

or alternatively

```
Uncaught Error: Minified React error #32; visit http://facebook.github.io/react/docs/error-decoder.html?invariant=32&args[]=## for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
```

This is a new problem when dealing with static sites built with React.  React uses HTML comments to help identify locations of components that do not render anything.  If you are using a CDN that minifies your HTML, it will eliminate the HTML comments used by react to take control of the page on the client.
