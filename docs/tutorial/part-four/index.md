---
title: Gatsby.js Tutorial Part Three
typora-copy-images-to: ./
---

Welcome to Part Four of the tutorial! Halfway through! Hope things are starting to feel pretty comfortable 😀

But don't feel too comfortable 😉. In this tutorial, we're going to travel into some new territory which will requires some brain stretching to fully understand. But don't worry, it'll be worth it. In the next two parts of the tutorial, we'll be diving into the Gatsby data layer!

## Recap of first half of the tutorial

So far we've been learning how to use React.js components to build websites. That we can easily create our own components to act as custom building blocks for building sites.

We've also explored styling components using CSS-in-JS which lets us encapsulate CSS within our components.

## Data

A website has four parts, HTML, CSS, JS, and data. The first half of the tutorial focused on the first three. Let's now learn how to use data in Gatsby sites.

What is data?

A very computer science-y answer would be—data is things like `"strings"`, integers (`42`), objects (`{ pizza: true }`), etc.

For the purpose of working in Gatsby however, a more useful answer is "everything that's not in a React component".

So far we've been writing text and adding images *directly* in components. Which is an *excellent* way to build many websites. But often you want to store data *outside* components and then bring the data *into* the component as needed.

Why's that? There's a few reasons. You'll often have data you want to reuse in many components e.g. your site title. Also it's often easier to write and maintain data/content outside of components. E.g. you build a blog with markdown files for posts or perhaps you setup Wordpress for a large Gatsby site where many people are contributing content through Wordpress.

Data you might want to use for sites can live in many places and exist in many forms.

* Markdown
* Wordpress and other CMSs
* CSV files
* Databases
* APIs

Gatsby's data layer lets us pull data from these and any other source directly into our components in the shape and form we want them.

## How Gatsby's data layer uses GraphQL to pull data into components 

If you're familiar with the React world, there's many options for how to load data into components. One of the most popular and robust of these is a technology called [GraphQL](http://graphql.org/).

GraphQL was invented at Facebook to help product engineers pull data into components.

GraphQL is a query language (the *QL* part of its name). If you're familiar with SQL, it works in a very similar way. You describe in code, using a special syntax, the data you want and then that data is given to you.

Gatsby uses GraphQL to let components declare, using GraphQL queries, the data it needs and then gives this data to components.

## Our first GraphQL query

Let's create a new site for this part of the tutorial like in the previous parts. We're going to build a simple markdown blog called "Pandas Eating Lots"! It's dedicated to showing off the best pictures & videos of Pandas eating lots of food. Along the way we'll be dipping our toes into GraphQL and Gatsby's markdown support.

```shell
gatsby new tutorial-part-four https://github.com/gatsbyjs/gatsby-starter-hello-world
```

Then install some other needed dependencies. We'll use the Typography theme Kirkham + we'll try out another CSS-in-JS library [Glamorous](https://glamorous.rocks/).

```shell
npm install --save gatsby-plugin-typography gatsby-plugin-glamor glamorous typography-theme-kirkham
```

Let's setup a site similar to what we ended with last time with a layout component and two page components.

`src/pages/index.js`

```jsx
import React from "react"

export default () =>
  <div>
    <h1>Amazing Pandas Eating Things</h1>
    <div>
      <img src="https://2.bp.blogspot.com/-BMP2l6Hwvp4/TiAxeGx4CTI/AAAAAAAAD_M/XlC_mY3SoEw/s1600/panda-group-eating-bamboo.jpg" />
    </div>
  </div>
```

`src/pages/about.js`

```jsx
import React from "react"

export default () =>
  <div>
    <h1>About Pandas Eating Lots</h1>
    <p>
      We're the only site running on your computer dedicated to showing the best
      photos and videos of pandas eating lots of food.
    </p>
  </div>
```

`src/layouts/index.js`

```jsx
import React from "react"
import g from "glamorous"
import { css } from "glamor"
import Link from "gatsby-link"

import { rhythm } from "../utils/typography"

const linkStyle = css({ float: `right` })

export default ({ children }) =>
  <g.Div
    margin={`0 auto`}
    maxWidth={700}
    padding={rhythm(2)}
    paddingTop={rhythm(1.5)}
  >
    <Link to={`/`}>
      <g.H3
        marginBottom={rhythm(2)}
        display={`inline-block`}
        fontStyle={`normal`}
      >
        Pandas Eating Lots
      </g.H3>
    </Link>
    <Link className={linkStyle} to={`/about/`}>
      About
    </Link>
    {children()}
  </g.Div>
```

`src/utils/typography.js`

```javascript
import Typography from "typography"
import kirkhamTheme from "typography-theme-kirkham"

const typography = new Typography(kirkhamTheme)

module.exports = typography
```

`gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    `gatsby-plugin-glamor`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
```

Add the above files and then run `gatsby develop` like normal and you should see the following:

![start](start.png)

Simple site with title in layout and two pages in navigation. Use Glamorous + rhythm

Replace title with query from site metadata. Introduce GraphiQL

hot reload title, all data is hot reloadable

## Source and transformer plugins

where else can data come from? EVERYWHERE!!!

source-filesystem — examine data in graphical, add some transformer plugins e.g. the react docgen perhaps or documentationjs

[DRAWING of cloudy data and stack of components with graphql in between]

## Creating pages from Markdown

gatsby-plugin-markdown-pages

component, fragments, etc.

## Index page

Introduce various options for querying e.g. filter, sort, etc.

## Archive page

common to have all posts listed on an archive page. Not necessary of course here since we have so few pages but it's a good exercise.s

## Image handling

gatsby-plugin-sharp / gatsby-remark-sharp & other remark plugins

add mainImage to posts and show those on front page