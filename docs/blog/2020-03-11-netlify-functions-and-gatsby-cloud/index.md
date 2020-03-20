---
title: "Using Netlify Functions with Gatsby Cloud"
date: 2020-03-25
author: "Josh Comeau"
excerpt: "An article detailing how to use Netlify Functions and Gatsby Cloud together, to tremendous effect!"
tags: ["netlify", "serverless", "lambda", "gatsby cloud"]
canonicalLink: https://joshwcomeau.com/gatsby/using-netlify-functions-with-gatsby-cloud/
---

import netlifyFunctions from "./gatsby-cloud.png"

Every now and then, Gatsby developers find themselves needing a sprinkle of back-end code. We don't necessarily need a whole server, and we certainly don't want to have to deal with things like load balancing and scaling. We just need some code to run not-in-the-browser.

Case in point: when I was rebuilding my [personal blog](https://joshwcomeau.com/), I wanted to track and display the number of likes each article gets, as well as the number of hits (for a retro-style hit counter).

For these kinds of situations, _serverless functions_ are perfect. They let us write small bits of Node.js code without worrying about where that code will run.

My personal blog is built and deployed with [Gatsby Cloud](https://www.gatsbyjs.com/), a CI service for Gatsby sites, and it's hosted by [Netlify](https://www.netlify.com/). I'm a very happy Netlify customer, and [Netlify Functions](https://www.netlify.com/products/functions/) seemed like the perfect service for my needs!

Getting Gatsby Cloud and Netlify Functions to cooperate took a bit of tinkering, but happily it can be done! The solution I discovered feels robust and reliable, and my blog has been powered by these two services for several weeks now, without any issues.

Today we'll look at how to use Netlify Functions for your Gatsby Cloud site.

## What are Netlify Functions?

Netlify functions let you run event-driven server-side code, without worrying about running and maintaining a server. It's a service that sits in front of AWS Lambda, and brushes away some of the thorns of working directly with Amazon Web Services.

It allows you to write code like this, used by my blog to track hits:

```js
const faunadb = require("faunadb")

exports.handler = async (event, context, callback) => {
  // Connect to the database
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  })

  // Get the provided slug, and use it to look up
  // the corresponding document.
  const { slug } = JSON.parse(event.body)
  const document = await client.query(
    q.Get(q.Match(q.Index("hits_by_slug"), slug))
  )

  // Increment the number of hits by 1
  await client.query(
    q.Update(document.ref, {
      data: { hits: document.data.hits + 1 },
    })
  )

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
    }),
  }
}
```

When using Netlify for CI _and_ deployments, you can pop this code in a `/functions` directory and the functions will get built and shipped whenever you push to Github. No manual steps needed 💯

Learn more about Netlify Functions in [their documentation](https://docs.netlify.com/functions/overview/).

## What is Gatsby Cloud?

Gatsby Cloud is a service provided by Gatsby Inc. to manage deployments of Gatsby apps.

Critically, Gatsby Cloud is _not_ an alternative to Netlify—we still use CDN providers like Netlify or Amazon S3 to host your projects. Rather, Gatsby Cloud is a CI service that builds your site and distributes it for you.

<img
  src={netlifyFunctions}
  alt="Screenshot of Gatsby Cloud, showing a successful recent deploy."
/>

There are lots of reasons to use Gatsby Cloud, but perhaps the most compelling reason for most developers is speed. We're building specialized infrastructure which allows us to build large Gatsby sites in record time.

## With our powers combined…

The trouble is that when using Gatsby Cloud, we aren't doing any building on Netlify; we build the site ahead of time, and upload the files to Netlify. This deprives Netlify of the opportunity to package and ship our functions!

Happily, we can work around this. We'll dive into how this all works, but for eager beavers, here's the code we need to add to `gatsby-node.js`.

```js
const path = require("path")
const fs = require("fs")

const { zipFunctions } = require("@netlify/zip-it-and-ship-it")

exports.onPostBuild = () => {
  const srcLocation = path.join(__dirname, `./functions`)
  const outputLocation = path.join(__dirname, `./public/functions`)

  if (!fs.existsSync(outputLocation)) {
    fs.mkdirSync(outputLocation)
  }

  return zipFunctions(srcLocation, outputLocation)
}
```

### Gatsby build hooks

In my opinion, one of the coolest things about Gatsby.js is that you can "hook in" to any of its build steps, like a lifecycle method.

`onPostBuild` runs right after the build completes. We can use it to prepare and copy the functions over to the right place, before it's handed off to Netlify.

Learn more about Gatsby build hooks in [our documentation](https://www.gatsbyjs.org/docs/node-apis/).

### Zip It and Ship It

Remember when I mentioned that Netlify brushes away the thorns of working with AWS Lambda? One of those thorns is the quirk that every function needs to be its own packaged project.

Let's say we have two functions, `track-hit.js` and `like-content.js`. And let's assume that they both use `faunadb`, a Node module. We need to produce two `.zip` files, with the following contents:

```
.
└── functions
    ├── track-hit.zip
    │   ├── track-hit.js
    │   └── node_modules
    │       ├── faunadb
    │       │   ├── index.js
    │       │   └── (all the other stuff in this module)
    │       ├── some-faunadb-dependency
    │       └── some-other-faunadb-dependency
    └── like-content.zip
        ├── like-content.js
        └── node_modules
            ├── faunadb
            │   ├── index.js
            │   └── (all the other stuff in this module)
            ├── some-faunadb-dependency
            └── some-other-faunadb-dependency
```

Because the folks at Netlify are wonderful wizards, they extracted the module that prepares functions and published it on NPM as `@netlify/zip-it-and-ship-it`. This means we can leverage this critical part of Netlify's build process even though we aren't building on Netlify.

### Cold and warm builds

When we ship our built project over to Netlify, it's going to look for functions in a very specific place: `/public/functions`. We need to have our built, prepared functions hanging out in that directory. Before we can build and prep the functions with `zip-it-and-ship-it`, we need to create the directory first!

This bit of code checks to see if the directory exists, and creates it if necessary:

```js
if (!fs.existsSync(outputLocation)) {
  fs.mkdirSync(outputLocation)
}
```

Why might the directory already exist? Gatsby Cloud maintains a cache, to speed up subsequent builds. A "cold build" will start from scratch, while a "warm build" will reuse what it can. We need to ensure our build succeeds regardless of whether or not the directory has been cached.

> Node purists are probably aghast in horror at the fact that I'm using `existsSync` and `mkdirSync` instead of their default async versions. Because this is a build step, and not an active server, I couldn't see any compelling issue with doing it this way, and it makes the code a little simpler!

## In conclusion

With a little bit of Node.js configuration, we're able to do some post-processing after the build, packaging up our functions and moving them to the spot Netlify expects to find them. When we push code to Github, Gatsby Cloud will run a new build, and then upload the resulting files to Netlify.

If you already have a Gatsby Cloud site, and you're considering using serverless functions, I can say unequivocally that Netlify makes the experience seamless and painless, and their generous pricing model means that you can experiment with them for free.

If you already use Netlify Functions and are considering moving your Gatsby site to Gatsby Cloud, we hope you'll give us a shot! One of our main focuses on the Gatsby Cloud team is to reduce the build time for complex / large sites. If you've been watching build times climb, we're doing our best to speed things up. ⚡️
