---
title: Gatsby.js Tutorial Part One
typora-copy-images-to: ./
---

Hello fellow Gatsby-er! Welcome to *part one* of our community Gatsby.js tutorial.

In this tutorial you'll be gently introduced to the Gatsby development environment, how to create component pages, and how to build and deploy Gatsby sites.

Sit down, buckle up, and let's get going!

## Check your development environment

Let's check first that you have everything setup to start creating with Gatsby. You will need a recent version of [Node.js](https://nodejs.org) installed.

Node.js is a programming tool for running JavaScript on servers and in your computer's terminal. Gatsby is built using Node.js.

Open a terminal window and type `node --version` then `npm --version`.

You should see something like:

![Check if node.js/npm is installed](check-versions.png)

Gatsby supports versions of Node back to v4 and NPM to v3.

If you don't have Node.js installed, go to https://nodejs.org/ and install the recommended version for your operating system.

## Install the "Hello World" starter

Gatsby uses "starters" for starting new projects. As the name suggests, starters are partially built Gatsby sites pre-configured to help you get moving faster. There are several official starters and many others contributed from the Gatsby community! [See the Starters page for the full list](/docs/gatsby-starters/).

To install a starter, first install Gatsby's terminal program.

```sh
npm install --global gatsby-cli
```



Once that's installed, run:

```sh
gatsby new tutorial-part-one https://github.com/gatsbyjs/gatsby-starter-hello-world
```



This command downloads the files for the starter and then installs the needed NPM packages. It should take around 1.5-3 minutes to finish.

Now let's now try running Gatsby!

Gatsby has a built-in development server. Let's start it up.

```sh
cd tutorial-part-one
npm run develop
```

You should see shortly some text that says `The development server is listening at:` [http://localhost:8000](http://localhost:8000). Open that address in your browser and...

![Gatsby.js hello world](hello-world.png)

Yeah! It's working!!!

Too cool 😎

Gatsby's development server is a "hot reloading" server meaning any change you make to your React.js page components (and later we'll learn, your data files) will hot reload in the browser.

This is huge because it makes development so much faster and fun.

Let's try it.

Try changing "Hello world!" in the page component to "Hello Gatsby!". You'll find the page component at `src/pages/index.js`. The text in your browser should change within a second.

Try some other tricks.

1. Gatsby let's you add "inline styles" via a JavaScript style "prop" (we'll learn about other styling options later).

   Try making your page component look like this:

```jsx
import React from "react"

export default () => <div style={{ color: `blue` }}>Hello Gatsby!</div>
```

   Change the color to "pink". Then "tomato".

2. Add some paragraph text.

```jsx{5-6}
import React from "react"

export default () =>
 <div style={{ color: `tomato` }}>
   <h1>Hello Gatsby!</h1>
   <p>What a world.</p>
 </div>
```

3. Add an image

```jsx{7}
import React from "react"

export default () =>
 <div style={{ color: `tomato` }}>
   <h1>Hello Gatsby!</h1>
   <p>What a world.</p>
   <img src="http://lorempixel.com/400/200/" />
 </div>
```

Now your screen should look something like this.

![Screen Shot 2017-06-03 at 11.57.10 AM](moving-along.png)

## Linking between pages

Websites are pages and links between pages. While we've now got a pretty sweet first page—one page and no links doesn't feel very webby. So let's create a new page.

First create the link to the new page.

To do that, import the `<Link>` component from the `gatsby-link` package that was installed along with the starter.

Unlike the normal HTML `<a>` element, our `Link` component uses `to` for specifying the page you want to link to. Let's link to a page with the pathname of `/page-2/`. Try adding that. Once you're done, the page component should look like:

```jsx{2,9-10}
import React from "react"
import Link from "gatsby-link"

export default () =>
  <div style={{ color: `tomato` }}>
    <h1>Hello Gatsby!</h1>
    <p>What a world.</p>
    <img src="http://lorempixel.com/400/200/" />
    <br />
    <Link to="/page-2/">Link</Link>
  </div>
```

Click on that link and you should see:

![Gatsby.js development 404 page](dev-404.png)

What you're seeing is the Gatsby.js development 404 page. Let's do what it says and create a React.js page component at `src/pages/page-2.js`.

Make the second page component look something like:

```jsx
import React from 'react'
import Link from 'gatsby-link'

export default () =>
  <div>
    <p>Hello world from my second Gatsby page</p>
    <Link to="/">back home</Link>
  </div>
```

Save that and now you should be able to click back and forth between the two pages!

<video controls="controls" autoplay="true" loop="true">
<source type="video/mp4" src="/images/clicking-2.mp4"></source>
<p>Your browser does not support the video element.</p>

</video>



## Interactive page

One nice thing about using Gatsby for building websites vs other tools is it's so easy to add interactivity to your pages. React.js was designed for Facebook.com and is used on many other world-class web applications.

Let's see how easy it is to add interactive elements to our pages.

We'll start by creating a new link to a page at `/counter`/ from our original `index.js` page component `<Link to="/counter/">Counter</Link>`.

Add that link, click on it, and then we'll create a "Hello World" page component for `/counter/` as before. But instead of using the "functional component" form as we did before, we'll create a "class" component.

```jsx
import React from "react"

class Counter extends React.Component {
  render() {
    return <div>Hello Class Component</div>
  }
}

export default Counter
```

The class form of React allows us to have component state. We'll need that for our counter.

Let's continue to flesh out our counter. Let's add two buttons. One to increment and one to decrement the count of the counter.

```jsx{5-12}
import React from "react"

class Counter extends React.Component {
  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: 0</p>
        <button>plus</button>
        <button>minus</button>
      </div>
    )
  }
}

export default Counter
```

So now we have everything we need to make a nice counter. Let's make it live.

First we'll setup the component state.

```jsx{4-7,12-13}
import React from "react"

class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 }
  }

  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: {this.state.count}</p>
        <button>plus</button>
        <button>minus</button>
      </div>
    )
  }
}

export default Counter
```

We're now rendering the current count from the component state.

Let's now change the state when we click on our buttons.

```jsx{14-19}
import React from "react"

class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 }
  }

  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          plus
        </button>
        <button onClick={() => this.setState({ count: this.state.count - 1 })}>
          minus
        </button>
      </div>
    )
  }
}

export default Counter
```

There you go! A working React.js counter inside your static website 👌

One fun thing too is that hot reloading isn't just for content and styles but it works on code as well. Try changing the amount by which clicking on the buttons changes the count.

## Deploying Gatsby.js websites on the web

Gatsby.js is a *static site generator* which makes deploying Gatsby sites to
the web really easy. There are no servers to setup or complicated databases to
deploy.  Instead, the Gatsby `build` command produces a directory of static
HTML and JavaScript files which you can deploy to a static site hosting
service.

Let's try using [Surge](http://surge.sh/) for deploying our first Gatsby website. Surge is one of many "static site hosts" which make it really easy to deploy Gatsby sites.

First install their terminal tool:

```bash
npm install --global surge
```

Then build your site by running in the terminal at the root of your site:

```bash
npm run build
```

Building should take 15-30 seconds. Take a look at the generated files by looking
at the `public` directory:

```bash
ls public
```

Then finally deploy your site by publishing the generated files to surge.sh. You'll first need to create a (free) account by typing `surge`. Then run:

```bash
surge public/
```

Once this finishes running, you should see in your terminal something like:

![Screenshot of publishing Gatsby site with Surge](surge-deployment.png)

Open the web address listed on the bottom line (`lowly-pain.surge.sh` in this case) and you'll see your newly published site!

## Good work!

In this tutorial, you've installed Gatsby, played in the development
environment, and deployed your first site! Awesome! We hope you're enjoying
yourself so far. Feel free to continue now on to [the second part of the tutorial](/tutorial/part-two/)
or go exploring around the rest of the site.
