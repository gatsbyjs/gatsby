---
title: Set Up Your Development Environment
typora-copy-images-to: ./
---

Before you start building your first Gatsby site, you’ll need to make sure that you have installed all required software tools.

## Overview of core technologies

It’s not necessary to be an expert with these already — if you’re not, don’t worry! You’ll pick up a lot through the course of this tutorial series. Beyond **HTML**, **CSS** and **JavaScript**, there are some extra pieces that are related to Gatsby:

- **Node.js**: Node.js is an environment that can run JavaScript code. Gatsby is built with Node.js.
- **React**: A code library (built with JavaScript) for building user interfaces. It’s the framework that Gatsby uses to build pages and structure content.
- **GraphQL**: A query language. A programming language that allows you to pull data into your website. It’s the interface that Gatsby uses for managing site data.

> 💡 (Optional!) For a comprehensive introduction to what a website is--including an intro to HTML and CSS--check out “[**Building your first web page**](https://learn.shayhowe.com/html-css/building-your-first-web-page/)”. It’s a great place to start learning about the web. For a more hands-on introduction to [**HTML**](https://www.codecademy.com/learn/learn-html), [**CSS**](https://www.codecademy.com/learn/learn-css), and [**JavaScript**](https://www.codecademy.com/learn/introduction-to-javascript), check out the tutorials from Codecademy. [**React**](https://reactjs.org/tutorial/tutorial.html) and [**GraphQL**](http://graphql.org/graphql-js/) also have their own introductory tutorials.

## Have Node.js

_Note: Gatsby's minimum supported Node.js version is Node 8, but feel free to use a more recent version._

Visit the [**Node.js site**](https://nodejs.org/) and follow the instructions to download and install the recommended version for your operating system. Node.js and npm is also available as prepackaged software in many Linux distributions.

Once you installed it, make sure everything is working properly:

### Check your Node.js installation

1.  Run `node --version`.
2.  Run `npm --version`.

![Check node and npm versions in terminal](01-node-npm-versions.png)

> 💡 Check out npm’s introduction, “[**What is npm?**](https://docs.npmjs.com/getting-started/what-is-npm)”.

## Installing the Gatsby CLI

The Gatsby CLI tool lets you quickly create new Gatsby-powered sites and run commands for developing Gatsby sites.

The Gatsby CLI is available via npm and should be installed globally by running `npm install -g gatsby-cli`.

To see the commands available to run `gatsby --help`.

> 💡 If you are unable to successfully run the Gatsby CLI due to a permissions issue, you may want to check out the [npm docs on fixing permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions), or [this guide](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).

## Create a Gatsby site

Now you are ready to use the Gatsby CLI tool to create your first Gatsby site. Using the tool, you can download “starters” (partially built sites with some default configuration) to help you get moving faster on creating a certain type of site. The “Hello World” starter you’ll be using here is a starter with the bare essentials needed for a Gatsby site.

In your terminal run:

```shell
gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world
cd hello-world
gatsby develop
```

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="./03-create-site.mp4"></source>
  <p>Sorry! You browser doesn't support this video.</p>
</video>

- Here, `hello-world` is an arbitrary title — you could pick anything. The CLI tool will place the code for your new site in a new folder called “hello-world”.

### View your site locally

Open up a new tab in your browser and navigate to [**http://localhost:8000**](http://localhost:8000/).

![Check homepage](04-home-page.png)

Congrats! This is the beginning of your very first Gatsby site! 🎉

**Note:** To make server listen on all addresses, not just localhost, run `gatsby develop -- --host=0.0.0.0`.

## ➡️ What’s Next?

To summarize, in this section you:

- Learned about web technologies used with Gatsby
- Installed Node.js, npm, and the Gatsby CLI tool
- Generated a new Gatsby site using the Gatsby CLI tool
- Ran and tested the Gatsby development server

Now, move on to [**getting to know Gatsby building blocks**](/tutorial/part-one/).
