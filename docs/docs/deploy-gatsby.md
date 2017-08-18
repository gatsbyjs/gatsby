---
title: "Deploying Gatsby"
---

## Best Practice


Though you can deploy from the same location multiple times it is recommended that you clear your public directory of any `.html` files before each build
e.g. using surge

```bash
rm -rf public/*.html && gatsby build && surge public/
```

We suggest creating an [NPM script](https://docs.npmjs.com/cli/run-script) for your deploy script.

## Tutorials for deploying on different static site hosts

* [S3/Cloudfront](/docs/deploy-gatsby/#amazon-s3-and-cloudfront)
* [Github Pages](/docs/deploy-gatsby/#github-pages)

## Amazon S3 and Cloudfront

If you decide to host your Gatsby site to S3 having Cloudfront as CDN you should edit on the Cloudfront panel the "Origin Domain Name" with the real URL of your S3 bucket: **examplewebsite.com.s3-website-eu-west-1.amazonaws.com** instead of the default one automatically suggested by Amazon **examplewebsite.com.s3.amazonaws.com**. 

This is recommended for rendering correctly the post pages in the subfolders without typing the index.html path as described [here](https://forums.aws.amazon.com/message.jspa?messageID=314454). 

## Github Pages

### Deploying a project page

You can deploy sites on Github Pages with or without a custom domain. If you choose to use the default setup (without a custom domain), you will need to setup your site with [path prefixing](/docs/path-prefix/).

### Use the NPM package `gh-pages` for deploying

First add **gh-pages** as a `devDependency` of your site and create an npm script command to **deploy** your project by running `npm install gh-pages --save-dev` or `yarn add gh-pages --dev` (if you have yarn installed).

Then add a **deploy** command in your `package.json` file.

```
"scripts": {
  "deploy": "rm -rf public && gatsby build --prefix-paths && gh-pages -d public",
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
