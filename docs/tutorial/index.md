---
title: Tutorial
typora-copy-images-to: ../tutorial/images
---

Hi! We're so happy you decided to try using Gatsby. This tutorial has (or rather will have once all parts are written) three parts:

1. Introduction to basics of Gatsby — Starting new projects, developing, and deploying sites.
2. How to work with different data sources, Markdown, JSON, Remote data sources, etc. As well as an introduction to Gatsby's data layer and writing queries with GraphQL.
3. Finishing and deploying a website. We walk through how to put the finishing touches on a website project.

## Environment

Let's check first that you have everything setup to start working with Gatsby. You will need a recent version of [Node.js](nodejs.org) installed.

Open a terminal window and type `node --version` then `npm --version`.

You should see something like:

![Check if node.js/npm is installed](images/Screen Shot 2017-06-03 at 11.20.52 AM.png)



Gatsby supports versions of Node back to v4 and NPM to v3.

If you don't have Node.js installed, go to https://nodejs.org/ and install the recommended version for your operating system.

## Creating a Gatsby site from scratch

Go to a directory on your computer for coding projects and create a new directory titled perhaps "my-first-gatsby-site".

Once inside the directory. Type `npm init`. This is a command to start a new Node.js project. You can just press enter through most of the questions.

![Init new project](images/Screen Shot 2017-06-03 at 11.37.53 AM.png)

Now type `ls` to see the list of files in your folder. You should see `package.json`.

Now we'll add the two dependencies required for a Gatsby site—`gatsby` and `gatsby-link`.

```shell
npm install --save gatsby@next gatsby-link@next
```

Installation should take a minute or two.

Now type `cat package.json` and you should see that `gatsby` and `gatsby-link` are now added to the `package.json` as `dependencies`.

```shell
~/p/my-first-gatsby-site: cat package.json
{
  "name": "my-first-gatsby-site",
  "version": "1.0.0",
  "description": "My first Gatsby site",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "gatsby": "^1.0.0-alpha19",
    "gatsby-link": "^1.0.0-alpha16"
  }
}
```

Sweet! We're making progress 😎

Let's now try running Gatsby!

Gatsby has a built-in development server. Let's start it up. (TODO tell people to use the `gatsby-cli` package once that's built).

You should see shortly some text that says `The development server is listening at: http://localhost:8000`. Open that address in your browser.

Run from your terminal `./node_modules/.bin/gatsby develop`

![Gatsby.js development 404 page](images/Screen Shot 2017-06-03 at 11.12.15 AM.png)

Yeah! It's working!!!

What you're seeing is the Gatsby.js development 404 page. Let's do what it says and create a React.js component at `src/pages/index.js`.

First create the `src/pages` directory.



```shell
mkdir -p src/pages
```

Then open up `src/pages/index.js` in your editor of choice and type in the "hello world" of components.

```jsx
import React from 'react'

export default () => <div>Hello world!</div>
```

Save that and… 😮😮😮

![It's alive!](images/Screen Shot 2017-06-03 at 11.45.54 AM.png)

Too cool 😎

Gatsby's development server is a "hot reloading" server meaning any change you make to your React.js components (and later we'll learn, you're data files) will hot reload in the browser.

This is huge because it makes development so much faster and fun.

Let's try it.

Try changing "Hello world!" in the component to "Hello Gatsby!". The text in your browser should change within a second.

Try some other tricks.

1. Gatsby let's you add "inline styles" via a JavaScript style "prop" (we'll learn about other styling options later).

   Try making your component look like this:

   ```jsx
   import React from "react"

   export default () => <div style={{ color: `blue` }}>Hello Gatsby!</div>
   ```

   Change the color to "pink". Then "tomato".

2. Add some paragraph text.

   ```jsx
   import React from "react"

   export default () =>
     <div style={{ color: `tomato` }}>
       <h1>Hello Gatsby!</h1>
       <p>What a world.</p>
     </div>
   ```

3. Add an image

   ```jsx
   import React from "react"

   export default () =>
     <div style={{ color: `tomato` }}>
       <h1>Hello Gatsby!</h1>
       <p>What a world.</p>
       <img src="http://lorempixel.com/400/200/" />
     </div>
   ```



Now you're screen should look something like this (other than the image which can vary).

![Screen Shot 2017-06-03 at 11.57.10 AM](images/Screen Shot 2017-06-03 at 11.57.10 AM.png)

## Linking between pages

Websites are pages and links between pages. While we've now got a pretty sweet first page, let's create a new one.

So let's first create the link to the new page.

To do that, import the `<Link>` component from the `gatsby-link` package we installed earlier.

Unlike the normal HTML `<a>` element, our `Link` component uses `to` for specifying where you'd like to link to. Let's link to a page with the pathname of `/my-second-gatsby-page/`. Try adding that. Once you're done, the component should look like:

```jsx
import React from "react"
import Link from "gatsby-link"

export default () =>
  <div style={{ color: `tomato` }}>
    <h1>Hello Gatsby!</h1>
    <p>What a world.</p>
    <img src="http://lorempixel.com/400/200/" />
    <br />
    <Link to="/my-second-gatsby-page/">Link</Link>
  </div>
```

Click on that link and again we see the development 404 page.

Let's do what it says again and create a new component at `src/pages/my-second-gatsby-page.js` and save it. Make sure to link back to the home page.

Now you should be able to click back and forth between the two pages!

<video controls="controls" autoplay="true" loop="true">
<source type="video/mp4" src="/images/clicking-small.mp4"></source>
<p>Your browser does not support the video element.</p>

</video>
