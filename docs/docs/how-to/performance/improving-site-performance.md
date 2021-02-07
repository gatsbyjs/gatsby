----
title: Improving Site Performance
----

To paraphrase Tolstoy, all fast websites are alike, but all slow websites are slow in different ways.

This document is a brief guide (emphasis on _brief_) to understanding why your Gatsby site might be slow. 

## Step 0: Use Gatsby

Gatsby gives you a ton of performance optimizations out of the box. 

[TKTK add links]

## Step 1: Use Gatsby Image and Gatsby Link

One of the most straightforward things you can do to improve the performance of your Gatsby site is use the primitives Gatsby gives you.

- Gatsby Image is our approach to optimizing the image loading experience. does three fundamental things to help you. First, it delays non-essential work for images not above the fold to avoid esource congestion. Second, it provides a placeholder during image fetch. And third, it minimizes image file size to reduce request roundtrip time. Read more about [why this matters](https://www.gatsbyjs.com/docs/conceptual/using-gatsby-image/), or [how to implement Gatsby Image](https://www.gatsbyjs.com/docs/how-to/images-and-media/using-gatsby-image/). 

- Gatsby Link is our approach to optimizing the intra-site navigation  experience. We pre-load linked pages on your site so that transitioning between pages is smooth and seamless. [Here's a guide to using Gatsby Link](https://www.gatsbyjs.com/docs/linking-between-pages/#the-gatsby-link-component). 

## Step 2: Use Lighthouse and other tools to identify improvement opportunities

There are a variety of different website performance testing tools. The most common ones in the Gatsby community are Lighthouse / PageSpeed Insights, which tends to be seen as more "canonical", and Webpagetest, which tends to be seen as more precise.

These tools measure what are known as "Core Web Vitals", which measure both time to page load and time to page interactivity. [Google's official page](https://web.dev/vitals/) has more detail on what these metrics are.

## Step 3: Implement Improvements.

When you run a test, it will give you a number of recommendations. While this can feel like a laundry list of issues, it can be helpful to understand the five core categories that these issues are bucketed into.

- Blocking calls & third-party scripts. 
- Javascript bundle size. 
- Stylesheets and font files.
- Images and other media. 
- Resource requests & CDN caching configuration.

Every site is different, and the recommendations will give some guidance as to where the highest effort to impact ratio is on your site. 

### Address third-party-script impact

Various types of calls made in your HTML, like calls to external font files, will block page load or page interactivity in different ways. In addition, third-party scripts can execute "eagerly", often delaying page load while they do so.

##### Lazy load all analytics plugins

One of the lowest-hanging fruits you can do is to set your scripts to load lazily rather than "eagerly" (the default). Any <script> tags being embedded manually can be set to <script async>.

##### Inline scripts

Rather than loading third-party scripts from external sources, you can inline scripts in your code to reduce the cost of a network call. Here's a [description of your options](https://github.com/gatsbyjs/gatsby/issues/24049#issuecomment-627944369) to do that.

### Reduce your Javascript bundle cost

Javascript can be costly to your performance for two main reasons. First, like other assets, it needs to be loaded into your browser, Second, unlike other assets, your browser needs to "evaluate" (ie, run) it, and this can "block" other work from happening. Third, with third-party npm modules, it's easy to accidentally add a lot of Javascript you don't actually need.

#### Profile your bundle

The first step to fix this is to figure out what's going on.Use gatsby-plugin-webpack-bundle-analyzer to profile your bundle. Here's a guide to understanding the output ([source here)](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack.config.js):

[TKTK format bundle table guide correctly]

[TKTK add an example annotated bundle picture]

#### Remove unneeded imports

There's a laundry list of things to do here. Here are a few:

- **Inspect third-party package size.** Anything over 100kb, and certainly 200kb, is worth examining whether it's needed. Some common culprits are Moment.js ([see deprecation notice](https://momentjs.com/docs/#/-project-status/)), Lodash, Material UI (see [here](https://www.freecodecamp.org/news/gatsby-perfect-lighthouse-score/#step3droppingmaterialuifortailwindcss)), but you'll want to inspect your individual libraries. To prevent this from recurring consider using a text editor or extension that displays the size of library imports you're pulling in (Visual Studio Code does this out of the box). 

- **Check if you're using Redux.** This one is a bit counterintuitive, but we've found it common when using Redux for it to bring in unnecessary bundles for particular pages. If you're only using Redux for a component on one page or two, try removing the component and testing the performance gains. 

- **Watch for unexpected large data imports.** Large JSON objects in pages that they're not needed is a good tell that you need to check the way you're importing them.

- **Advanced: partial "[tree shaking](https://webpack.js.org/guides/tree-shaking/#conclusion)"**. Tree-shaking is a method to eliminate dead unused code. If you're using CommonJS import syntax with v2 of Gatsby, you may only be eliminating dead code on an app level rather than a page level. That is, you're pulling in code that's used on other pages but not the one you're on.  If you see that a number of the same components are being loaded on every page of your site, taking up a sizeable part of the JS bundle, you may want to look into this.

#### Lazy-load below-the-fold components using loadable-components

Gatsby's default behavior is to bundle the entire page together. However, there may be some components that don't need to be loaded right away. Perhaps your home page is quite long and you don't mind "deferring" the load of a few images or interactive elements far down on the page, if it makes the initial page load faster.

In this case, one option is to lazy-load below-the-fold components using the `loadable-components` library. `loading-components` is the recommended lazy-loading solution for all server-side-rendered React applications, including Gatsby websites.

To see how to use this library, check the [loadable-components documentation](https://loadable-components.com/docs/getting-started/). We recommend you use the [gatsby plugin to install loadable-components](https://www.gatsbyjs.com/plugins/gatsby-plugin-loadable-components-ssr/).

#### Consider switching to preact

[Gatsby-plugin-preact](https://www.gatsbyjs.com/plugins/gatsby-plugin-preact/) is a drop-in plugin that will render your site in Preact instead of React, typically saving around 30kb from the Javascript bundle.  This is an interesting though advanced way to decrease bundle size. In certain, occasional edge cases this can create ill-documented, odd user interactions; we do not recommend this for sites with complex UI logic, like a SaaS app.\
After installing this, you'll need to use [Preact Developer Tools](https://chrome.google.com/webstore/detail/preact-developer-tools/ilcajpmogmhpliinlbcdebhbcanbghmd?hl=en) instead of [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) to inspect your component behavior.

### Styling & Fonts

Gatsby's out-of-the-box behavior makes it hard to pull in unused Javascript to your bundle, but when working with CSS and fonts, there are certain additional patterns you'll need to follow or tools to use.

#### Globally bundled CSS

Without properly scoped and imported CSS you can end up with a large bundle with all your CSS getting pulled in on every page. What you want, instead, is a small bundle pulling in only needed CSS.

You can use the [Coverage drawer](https://developers.google.com/web/tools/chrome-devtools/coverage) in Chrome's Dev Tools to detect the proportion of unused CSS on each page. In Gatsby, the CSS is inlined into the HTML, so when running Coverage look at line with the URL of the page you loaded (it should be the first one), and eyeball the number of unused bytes and % of red in the Usage Visualization.

A good tell for eg a company's website is seeing 1mb of unused code and red is >80% of the bundle. You can scroll through the page on the usage drawer to look at the unused CSS and get a sense of whether it is needed for that page.

To fix these issues, look at moving to a modular CSS solution like CSS modules [TKTK link to docs].

When CSS is being pulled in properly, you'll typically have closer to 20-40% of unused code (think CSS to define responsive layouts that isn't evaluated on desktop format, Javascript inside click handlers, etc). 

#### If you're using a CSS-in-JS library, use the Gatsby plugin

If you're using a CSS-in-JS library like styled-components or emotion, use the relevant plugin, which will server-side render it. Otherwise, the output HTML will intersperse `<style>` tags with HTML elements, which can cause costly layout reflow (ie, the browser will be recalculating the page's layout more often). 

#### Fonts

Font files can usually be reduced in size significantly. If your font file is over 100kb, or even 50kb, it is likely too large.

- **Prefer `woff2` and `woff` to `ttf` format.** `Woff2` and `woff` are compressed font formats. Like using `avif` and `webp` instead of `png` and `jpg`, this can significantly cut down the amount of data sent over the network. Here's a [quick background on these font formats](https://developer.mozilla.org/en-US/docs/Web/Guide/WOFF) and a [guide on correct CSS syntax](https://gist.github.com/sergejmueller/cf6b4f2133bcb3e2f64a).   

- **Self-host fonts rather than using an external CDN.** Having the font file available locally will save a trip over the network. 

- **Use Latin font subsets only** (if creating a Latin-language site). It's common to accidentally include font extensions (Greek, Cyrillic, Devnagari, Chinese) when typically you only need the Latin base set. The [Google Webfonts Helper app](https://google-webfonts-helper.herokuapp.com/fonts/SourceSansPro) can help you do this with free fonts.

Font optimizations are usually small, but easy performance wins. 

### Images & Media

Media files are often the largest files you load on a site, and so can delay page load significantly while they are pulled over the network, especially if their location is not well-defined. The good news is that gatsby--image solves these problems :)

[TKTK add additional detail and links]

### Resource Requests & CDN Configuration

Assets need to have proper cache configuration on the CDN. [better explanation TKTK]

-   Preconnect to subdomains
-   Proper CDN caching policies

[TKTK add additional detail]

## Step 4: Test the Impact of Changes

As you're going through the changes in the following section, you will likely want to understand the impact of each change or set of changes, to understand if something is "worth doing". How you can do this:

- Write a pull request with each change or set of changes, using a service like Gatsby Cloud or Netlify that generates deploy previews per-PR.
- Then run Lighthouse tests against the deploy preview for that branch and the deploy preview for master (not the live site since the CDN setup may differ). 
- Then calculate the difference in Lighthouse scores that each script

Perhaps one change gives you a 2-point Lighthouse improvement and another gives you a 20-point improvement, which can be quite useful information.

For additional precision, run Lighthouse multiple times and take the median result. 

## Additional Resources

- If you want an in-depth, more generalized guide to performance optimization that isn't specific to Gatsby sites, look at [Smashing Magazine's Frontend Performance Checklist](https://www.smashingmagazine.com/2021/01/front-end-performance-2021-free-pdf-checklist/#delivery-optimizations).