---
title: Introduction to Gatsby
date: 2018-05-31
author: Michelle Barker
excerpt: "In case you haven’t heard about it, Gatsby is the latest hot thing in static site generators"
tags: ["cutting-edge-experiences", "graphql", "blogs"]
canonicalLink: https://css-irl.info/introduction-to-gatsby/
publishedAt: css-irl.info
---

In case you haven’t heard about it, Gatsby is the latest hot thing in static site generators. While many static site generators (SSGs) use templating languages like Handlebars or Mustache, Gatsby uses React, helping contribute to its “blazing fast” claim.

Having never used an SSG before (although I’ve read about them), and with very limited experience with React, what better way to dip my toe into the water than using Gatsby to publish my brand new blog [CSS {In Real Life}](https://css-irl.info/)?

### Getting started

It turns out that getting started with Gatsby is pretty easy. The Gatsby site features a fantastic, step-by-step tutorial that walks you through getting your first site up and running (even down to deploying), and contains a wealth of resources for when you’ve mastered the basics. You don’t need any prior experience with React, although working with Gatsby definitely made me want to learn React to take full advantage of its power.

One thing that prohibits me from publishing side projects is the thought of configuring a whole build setup with Gulp, webpack, etc. just for something small. This is where Gatsby really appeals to me. Gatsby provides an entire out-of-the-box build setup. Yep. Run `npm run develop` and immediately you can bypass all that configuration and start building cool stuff in the browser (with live reloads). Run `npm run build` and your production code is optimised (including progressive image loading and code splitting, among many other features) with _absolutely no effort on your part whatsoever_. You could feasibly get a small, performant site built and deployed in just minutes. You can also add a custom webpack config if you need to.

### CSS

There are two options when it comes to writing CSS for your components: CSS-in-JS (using libraries such as Glamor and Styled Components) or [CSS Modules](https://github.com/css-modules/css-modules). As I feel far more comfortable writing “traditional” CSS, I opted for the latter. CSS Modules are really interesting, and not tied to Gatsby. Styles are scoped locally by default and unique class names are generated programmatically, meaning you don’t get the clashes with naming and specificity that you sometimes get in traditional CSS, and you can compose new selectors from others. I feel like I’ve only scratched the surface of CSS Modules, and am looking forward to experimenting further.

_(Side note: This doesn’t mean I have a problem with traditional CSS, or that I’m advocating CSS Modules in every scenario! Many of the so-called “problems” of CSS are actually down to misuse or misapplication. Nevertheless, CSS Modules and CSS-in-JS are good to know about, and can be useful tools to have in your arsenal.)_

### Plugins

There is a whole ecosystem of Gatsby plugins that you can pick and choose to tailor your project. I’m using `gatsby-plugin-sass` to enable me to write Sass instead of regular CSS, `gatsby-transformer-remark` for markdown files and `gatsby-plugin-typography` which sets you up with some nice typography combos with minimal configuration. Authoring your own plugins and contributing to the Gatsby community is encouraged, if that’s your bag.

### Data

You could of course hard code all your content, but it’s likely you’ll want some sort of dynamic content on your site.

Gatsby’s data layer is powered by GraphQL, and the tutorial walks through how to build database queries with Gatsby’s GraphiQL tool. It’s very visual, showing you exactly what your database queries will return, which for someone like me (who finds anything database-related a little scary) is a blessing.

I write my blog posts in markdown files, but you could configure Gatsby to work with GitHub Pages, or the CMS of your choice for a better editorial experience.

### Deployment

After you’ve run the build command, Gatsby allows near-instantaneous deployment through [Surge](https://surge.sh/), [Netlify](https://www.netlify.com/) and others. I set up my hosting with Netlify – run `gatsby deploy`, set up a Netlify account and you’re good to go. You can then configure Netlify to auto-deploy whenever you push to a repository. Netlify provides a simpler and more helpful experience than other hosting providers I’ve used, with helpful documentation, taking all the stress away from launching a site!

### In conclusion

I thoroughly recommend giving Gatsby a go if you’re on the fence about trying a static site generator and want to get a simple site up and running quickly and easily. The amount of thought that’s gone into every aspect of the onboarding process and the developer experience is absolutely fantastic. And, have just received a shed load of seed money to launch as a startup, it’s only going to get better.
