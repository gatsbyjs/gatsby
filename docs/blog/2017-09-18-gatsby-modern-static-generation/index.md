---
title: "Modern static site generation with Gatsby"
date: "2017-09-18"
image: "code-image.jpg"
author: "Kostas Bariotis"
excerpt: "In this post, I will talk about static site generators -- how they have evolved and why I switched from a Ghost powered site to Gatsby.js, a modern static site generator."
---

In this post, I will talk about static site generators -- how they have evolved
and why I switched from a [Ghost](https://ghost.org) powered site to
[Gatsby.js](/), a modern static site generator.

## Static site generators as we know them

Jekyll, my tool of preference for quite a few years, helped me build
[robust](http://devastation.tv) [professional](http://devitconf.org)
[web presences](http://skgtech.io) that content managers can update with the
click of a button. It helped me quickly move a project of mine from idea to
production by creating a landing page very fast.

Static site generators like Jekyll all work pretty similarly:

* Describe your content in some common templating language ([Pug](http://pugjs.org),
  [Handlebars](http://handlebarsjs.com), etc)
* While in development, start a local web server and add file "watchers" that
  will listen for content changes and re-render the site
* Finally, render the whole site in static HTML and deploy. The generator will
  combine your files and produce a well formed HTML content.

Let’s say you navigate to the good old site example.com:

* The browser requests the page at example.com
* The server responds with the HTML content
* The browser renders the page and loads the asset related to the script tag
* JS will instruct the browser to manipulate the DOM, for example, to show a
  “welcome to this page” popup dialog.

A caveat here is that you have to keep the client side logic separated from the
backend. The client side JS file that shows the modal dialog has nothing to do
with the PUG file you wrote and eventually became HTML. The client side logic
only manipulates directly the DOM.

This architecture is fairly similar to a Wordpress site. A Wordpress engine also
generates the HTML and serve it to the browser, after which the client side JS
you wrote kicks in and starts manipulating the DOM. Wordpress’s responses can be
cached, of course, and served to the client; that setup effectively makes it
another static site generator with a GUI text editor.

So to recap, the nice part of the static site setup is that your website is just
static assets that are sitting somewhere ready to be served to user requests. No
need to maintain a runtime, a database, application code, or complex optimized
web servers.

But the downside is you have to keep separate template files that will
eventually rendered as HTML on the browser, and Javascript file that will
eventually manipulate that HTML again on the browser (and CSS assets too).

## Enter the new world order

I [started experimenting](https://kostasbariotis.com/hands-on-react-js/) with
React two years ago. It came with so many features out of the box that no one
ever has seen except the guys working internally on Facebook’s codebase. But the
thing that stood out immediately was the way which React was handling the DOM,
aka the Virtual DOM.

To change a page’s display, you have to change the DOM -- but changing the DOM
is computationally expensive, so -- slow. React is smart, and analyzes the
changes you want to make so it applies only required changes, thus making the
rendering much faster.

If you use React with
[server-side rendering](https://facebook.github.io/react/docs/react-dom-server.html),
your flow looks something like this:

* A browser requests a page
* The server responds with static HTML
* The browser immediately renders the page so the user can see it
* The browser loads additional JS in the background
* The client takes some action, like navigating to a different route.
* The browser uses the additional JS to handle this action.

On your end, the development flow looks:

* Describe your content in React.js Components
* During development, write code like a boss (hot reloading, modularized code,
  webpack plugins, etc...)
* Use React.js Server Side Rendering API to convert this code to static HTML
  content, and Javascript code, on your server

It’s really that easy? Well, sort of.

There is the need for a strong abstraction that will…

* track your links across your components
* parse content written in another format, like blog posts written in Markdown
* generate code that will not bloat the client and will efficiently serve the
  content to the user.

Thankfully, there are a few projects that took the initiative on this:
[Gatsby.js](/), [Phenomic](https://phenomic.io), and
[nextein](https://nextein.now.sh).

At the time that I started following them, early 2017, all of them were in a
very early stage and none of them could generate my site's content the way I
wanted.

I wanted to make the generated site, exactly like the old one, in terms of both
user experience and keeping my old routes and paths so I don’t have weird 404s.

Gatsby came with client side routing out of the box and an extensive API that
you can use to generate your content exactly like you need. And once Gatsby.js
hit major version 1, I started using it and the result...you can
[look at it](https://kostasbariotis.com/)!

## What exactly am I looking at?

First, if you navigate around my blog (or around this site!), you will notice
that the browser doesn't fully re-render the site. Gatsby will generate a JSON
file for each route, so the browser can request only that file and React.js will
render only the appropriate components.

(Previously to do this required a lot of customization -- I was using a
technique called
[pjax](https://github.com/kbariotis/kostasbariotis.com__ghost-theme/blob/master/src/js/app.js#L11)
to create the same effect. While it looked the same, it was more hack-ish;
Gatsby provides this out of the box)

Second, you can take a look at the
[source code](https://github.com/kbariotis/kostasbariotis.com). Let me give you
a sense of how this site is being generated. You can find all my blog posts and
the main pages(`/`, `/about`, `/drafts`) of this site at
[`/src/pages`](https://github.com/kbariotis/kostasbariotis.com/tree/master/src/pages).
Common components can be found at
[`/src/components`](https://github.com/kbariotis/kostasbariotis.com/tree/master/src/components).
At
[`/gatsby-node.js`](https://github.com/kbariotis/kostasbariotis.com/tree/master/gatsby-node.js)
you can find the route it takes in order to render the site. First, it loads all
posts using the GraphQL api which queries all `.md` files. Then it creates a
page for each one, using the
[`/src/templates/blog-post.js`](https://github.com/kbariotis/kostasbariotis.com/tree/master/src/templates/blog-post.js)
template and before that it creates a page, with pagination, for all posts and
tags again using the appropriate template file.

During development, Gatsby will generate all of these in memory and fire up a
development server that I can use to preview my site.

You can try it yourself by cloning the
[source code](https://github.com/kbariotis/kostasbariotis.com) and after
installing dependencies, run:

* `npm run develop` to fire up the development server
* `npm run build` to build the site (check the `/public` folder after it’s done)

## An alternative to HTML caching

Now let’s bring these threads together. Let’s say you have a Wordpress site.
You’re caching the content, which is nice for performance, but you’re building
on it now and want to move to a more modern web development experience.

One path is the one I took -- for the last three years, I was using a similar
system called [Ghost](https://ghost.org). While it served me well, I really got
tired of updating it, ssh-ing to the server, doing migrations and doing other
ops required by such a stack. (There are paid hosting options, of course, but
that comes with a different set of problems). So I switched to Gatsby.

Another option, if you want to keep Wordpress' Admin UI is to maintain your
content, is to separate the backend from the frontend.

Imagine that instead of having [memcached](https://memcached.org/) caching your
HTML in front of your WordPress site, you trigger a hook each time your database
changes that will re-generate the frontend using Gatsby’s
[Wordpress plugin](/packages/gatsby-source-wordpress/). Yes, Gatsby supports
multiple backend sources to load your content. Instead of storing them inside
your version control like me, you can just as well load them from your
Wordpress's MySQL database.

To conclude, Gatsby will allow us to:

* serve static content without maintaining complex stacks
* keep a clear separation between content and the presentation layer
* have cool features like client side routing and hot reload on development, out
  of the box
* reuse the same code that is being used to generate the backend content at our
  visitors' browsers

I hope you will experiment with Gatsby, and let me know what you think!
