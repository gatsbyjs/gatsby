---
title: Data in Gatsby
typora-copy-images-to: ./
disableTableOfContents: true
---

Welcome to Part Four of the tutorial! Halfway through! Hope things are starting to feel pretty comfortable 😀

## Recap of the first half of the tutorial

So far, you've been learning how to use React.js—how powerful it is to be able to create your _own_ components to act as custom building blocks for websites.

You’ve also explored styling components using CSS Modules.

## What's in this tutorial?

In the next four parts of the tutorial (including this one), you'll be diving into the Gatsby data layer, which is a powerful feature of Gatsby that lets you build sites from Markdown, WordPress, headless CMSs, and other data sources of all flavors.

**NOTE:** Gatsby’s data layer is powered by GraphQL. For an in-depth tutorial on GraphQL, we recommend [How to GraphQL](https://www.howtographql.com/).

## Data in Gatsby

A website has four parts: HTML, CSS, JS, and data. The first half of the tutorial focused on the first three. Now let’s learn how to use data in Gatsby sites.

**What is data?**

A very computer science-y answer would be: data is things like `"strings"`, integers (`42`), objects (`{ pizza: true }`), etc.

For the purpose of working in Gatsby, however, a more useful answer is "everything that lives outside a React component".

So far, you've been writing text and adding images _directly_ in components. Which is an _excellent_ way to build many websites. But, often you want to store data _outside_ components and then bring the data _into_ the component as needed.

If you're building a site with WordPress (so other contributors have a nice interface for adding & maintaining content) and Gatsby, the _data_ for the site (pages and posts) are in WordPress and you _pull_ that data, as needed, into your components.

Data can also live in file types like Markdown, CSV, etc. as well as databases
and APIs of all sorts.

**Gatsby's data layer lets you pull data from these (and any other source) directly into your components** -- in the shape and form you want.

## Using Unstructured Data vs GraphQL

### Do I have to use GraphQL and source plugins to pull data into Gatsby sites?

Absolutely not! You can use the node `createPages` API to pull unstructured data into Gatsby pages directly, rather than through the GraphQL data layer. This is a great choice for small sites, while GraphQL and source plugins can help save time with more complex sites.

See the [Using Gatsby without GraphQL](/docs/how-to/querying-data/using-gatsby-without-graphql/) guide to learn how to pull data into your Gatsby site using the node `createPages` API and to see an example site!

### When do I use unstructured data vs GraphQL?

If you're building a small site, one efficient way to build it is to pull in unstructured data as outlined in this guide, using `createPages` API, and then if the site becomes more complex later on, you move on to building more complex sites, or you'd like to transform your data, follow these steps:

1. Check out the [Plugin Library](/plugins/) to see if the source plugins and/or transformer plugins you'd like to use already exist
2. If they don't exist, read the [Plugin Authoring](/docs/creating-plugins/) guide and consider building your own!

### How Gatsby's data layer uses GraphQL to pull data into components

There are many options for loading data into React components. One of the most popular and powerful of these is a technology called [GraphQL](https://graphql.org/).

GraphQL was invented at Facebook to help product engineers _pull_ needed data into components.

GraphQL is a **q**uery **l**anguage (the _QL_ part of its name). If you're familiar with SQL, it works in a very similar way. Using a special syntax, you describe the data you want in your component and then that data is given to you.

Gatsby uses GraphQL to enable components to declare the data they need.

## Create a new example site

Create another new site for this part of the tutorial. You're going to build a Markdown blog called "Pandas Eating Lots". It's dedicated to showing off the best pictures and videos of pandas eating lots of food. Along the way, you'll be dipping your toes into GraphQL and Gatsby's Markdown support.

Open a new terminal window and run the following commands to create a new Gatsby site in a directory called `tutorial-part-four`. Then navigate to the new directory:

```shell
gatsby new tutorial-part-four https://github.com/gatsbyjs/gatsby-starter-hello-world
cd tutorial-part-four
```

Then install some other needed dependencies at the root of the project. You'll use the Typography theme "Kirkham", and you'll try out a CSS-in-JS library, ["Emotion"](https://emotion.sh/):

```shell
npm install gatsby-plugin-typography typography react-typography typography-theme-kirkham gatsby-plugin-emotion @emotion/react
```

Set up a site similar to what you ended with in [Part Three](/docs/tutorial/part-three). This site will have a layout component and two page components:

```jsx:title=src/components/layout.js
import React from "react"
import { css } from "@emotion/react"
import { Link } from "gatsby"

import { rhythm } from "../utils/typography"

export default function Layout({ children }) {
  return (
    <div
      css={css`
        margin: 0 auto;
        max-width: 700px;
        padding: ${rhythm(2)};
        padding-top: ${rhythm(1.5)};
      `}
    >
      <Link to={`/`}>
        <h3
          css={css`
            margin-bottom: ${rhythm(2)};
            display: inline-block;
            font-style: normal;
          `}
        >
          Pandas Eating Lots
        </h3>
      </Link>
      <Link
        to={`/about/`}
        css={css`
          float: right;
        `}
      >
        About
      </Link>
      {children}
    </div>
  )
}
```

```jsx:title=src/pages/index.js
import React from "react"
import Layout from "../components/layout"

export default function Home() {
  return (
    <Layout>
      <h1>Amazing Pandas Eating Things</h1>
      <div>
        <img
          src="https://2.bp.blogspot.com/-BMP2l6Hwvp4/TiAxeGx4CTI/AAAAAAAAD_M/XlC_mY3SoEw/s1600/panda-group-eating-bamboo.jpg"
          alt="Group of pandas eating bamboo"
        />
      </div>
    </Layout>
  )
}
```

```jsx:title=src/pages/about.js
import React from "react"
import Layout from "../components/layout"

export default function About() {
  return (
    <Layout>
      <h1>About Pandas Eating Lots</h1>
      <p>
        We're the only site running on your computer dedicated to showing the
        best photos and videos of pandas eating lots of food.
      </p>
    </Layout>
  )
}
```

```javascript:title=src/utils/typography.js
import Typography from "typography"
import kirkhamTheme from "typography-theme-kirkham"

const typography = new Typography(kirkhamTheme)

const { rhythm, scale } = typography;
export { rhythm, scale, typography as default };
```

`gatsby-config.js` (must be in the root of your project, not under src)

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
```

Add the above files and then run `gatsby develop`, per usual, and you should see the following:

![start](start.png)

You have another small site with a layout and two pages.

Now you can start querying 😋

## Your first GraphQL query

When building sites, you'll probably want to reuse common bits of data -- like the _site title_ for example. Look at the `/about/` page. You'll notice that you have the site title (`Pandas Eating Lots`) in both the layout component (the site header) as well as in the `<h1 />` of the `about.js` page (the page header).

But what if you want to change the site title in the future? You'd have to search for the title across all your components and edit each instance. This is both cumbersome and error-prone, especially for larger, more complex sites. Instead, you can store the title in one location and reference that location from other files; change the title in a single place, and Gatsby will _pull_ your updated title into files that reference it.

The place for these common bits of data is the `siteMetadata` object in the `gatsby-config.js` file. Add your site title to the `gatsby-config.js` file:

```javascript:title=gatsby-config.js
module.exports = {
  // highlight-start
  siteMetadata: {
    title: `Title from siteMetadata`,
  },
  // highlight-end
  plugins: [
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
```

Restart the development server.

### Use a page query

Now the site title is available to be queried; Add it to the `about.js` file using a [page query](/docs/how-to/querying-data/page-query):

```jsx:title=src/pages/about.js
import React from "react"
import { graphql } from "gatsby" // highlight-line
import Layout from "../components/layout"

// highlight-next-line
export default function About({ data }) {
  return (
    <Layout>
      <h1>About {data.site.siteMetadata.title}</h1> {/* highlight-line */}
      <p>
        We're the only site running on your computer dedicated to showing the
        best photos and videos of pandas eating lots of food.
      </p>
    </Layout>
  )
}

// highlight-start
export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
// highlight-end
```

It worked! 🎉

![Page title pulling from siteMetadata](site-metadata-title.png)

The basic GraphQL query that retrieves the `title` in your `about.js` changes above is:

```graphql:title=src/pages/about.js
{
  site {
    siteMetadata {
      title
    }
  }
}
```

> 💡 In [part five](/docs/tutorial/part-five/#introducing-graphiql), you'll meet a tool that lets us interactively explore the data available through GraphQL, and help formulate queries like the one above.

Page queries live outside of the component definition -- by convention at the end of a page component file -- and are only available on page components.

### Use a StaticQuery

[StaticQuery](/docs/how-to/querying-data/static-query/) is a new API introduced in Gatsby v2 that allows non-page components (like your `layout.js` component), to retrieve data via GraphQL queries. Let's use its newly introduced hook version — [`useStaticQuery`](/docs/how-to/querying-data/use-static-query/).

Go ahead and make some changes to your `src/components/layout.js` file to use the `useStaticQuery` hook and a `{data.site.siteMetadata.title}` reference that uses this data. When you are done, your file will look like this:

```jsx:title=src/components/layout.js
import React from "react"
import { css } from "@emotion/react"
// highlight-next-line
import { useStaticQuery, Link, graphql } from "gatsby"

import { rhythm } from "../utils/typography"
// highlight-start
export default function Layout({ children }) {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )
  return (
    // highlight-end
    <div
      css={css`
        margin: 0 auto;
        max-width: 700px;
        padding: ${rhythm(2)};
        padding-top: ${rhythm(1.5)};
      `}
    >
      <Link to={`/`}>
        <h3
          css={css`
            margin-bottom: ${rhythm(2)};
            display: inline-block;
            font-style: normal;
          `}
        >
          {data.site.siteMetadata.title} {/* highlight-line */}
        </h3>
      </Link>
      <Link
        to={`/about/`}
        css={css`
          float: right;
        `}
      >
        About
      </Link>
      {children}
    </div>
    // highlight-start
  )
}
// highlight-end
```

Another success! 🎉

![Page title and layout title both pulling from siteMetadata](site-metadata-two-titles.png)

Why use two different queries here? These examples were quick introductions to the query types, how they are formatted, and where they can be used. For now, keep in mind that only pages can make page queries. Non-page components, such as Layout, can use StaticQuery. [Part 7](/docs/tutorial/part-seven/) of the tutorial explains these in greater depth.

But let's restore the real title.

One of the core principles of Gatsby is that _creators need an immediate connection to what they're creating_ ([hat tip to Bret Victor](http://blog.ezyang.com/2012/02/transcript-of-inventing-on-principle/)). In other words, when you make any change to code you should immediately see the effect of that change. You manipulate an input of Gatsby and you see the new output showing up on the screen.

So almost everywhere, changes you make will immediately take effect. Edit the `gatsby-config.js` file again, this time changing the `title` back to "Pandas Eating Lots". The change should show up very quickly in your site pages.

![Both titles say Pandas Eating Lots](pandas-eating-lots-titles.png)

## What's coming next?

Next, you'll be learning about how to pull data into your Gatsby site using GraphQL with source plugins in [part five](/docs/tutorial/part-five/) of the tutorial.
