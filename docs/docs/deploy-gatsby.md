---
title: "Deploying Gatsby"
---

## Best Practice


Though you can deploy from the same location multiple times it is recommended that you clear your public directory of any `.html` files before each build
e.g. using surge

```bash
rm -rf public/*.html && gatsby build && surge public/
```

because this is going to be executed on every deploy it is suggested that you use a `package.json` script to simplify this process

## Providers

[Surge.sh](http://surge.sh/)

[Forge](https://getforge.com/)

[Netlify](https://www.netlify.com/)

[GitHub-Pages](https://pages.github.com/)

## Debugging

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

## Hosting on Amazon S3 and Cloudfront
If you decide to host your Gatsby site to S3 having Cloudfront as CDN you should edit on the Cloudfront panel the "Origin Domain Name" with the real URL of your S3 bucket: **examplewebsite.com.s3-website-eu-west-1.amazonaws.com** instead of the default one automatically suggested by Amazon **examplewebsite.com.s3.amazonaws.com**. 

This is recommended for rendering correctly the post pages in the subfolders without typing the index.html path as described [here](https://forums.aws.amazon.com/message.jspa?messageID=314454). 

## Deploying on Github Pages
### Deploying a Project Page
Deploying Project on Github pages can be done with or without Custom Domain. If you choose to use the default setup (without Custom Domain), you will need to prefix your links (ex. gatsbypage.github.io/project-name/about-page - "/project-name" will be prefixed in all your links).

#### Without Custom Domain
First you have to add **gh-pages** as a dev-dependency and create an npm script command to **deploy** your project.

Run `npm install gh-pages --save-dev` or `yarn add gh-pages --dev` (if you have yarn installed). Alternatively, you can place this under *"devDependencies"* in you `package.json` file:

```
"devDependencies": {
  "gh-pages": "^1.0.0",
}
```

Then run `npm install` or `yarn install`.

Add a **deploy** command in your `package.json` file.

```
"scripts": {
  "deploy": "rm -rf public && gatsby build --prefix-paths && gh-pages -d public",
}
```

In the `gatsby-config.js` add the path-prefix to be added to the links. The path-prefix should be the project name in your repository. (ex. `https://github.com/username/project-name` - your pathPrefix should be `/project-name`).

```
module.exports = {
  pathPrefix: `/project-name`,
}
```

In your Github Repository, create a new branch `gh-pages`. Make sure that in `Settings` > `Github Pages` > `Source` your github pages branch is set to `gh-pages branch`.

After the setup, run `yarn deploy` or `npm run deploy`. Preview changes in your github page `https://username.github.io/project-name/`. You also can view your link under `Settings` > `Github Pages`. 
