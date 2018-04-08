---
title: Querying for data in a blog
typora-copy-images-to: ./
---

Welcome to Part Four of the tutorial! Halfway through! Hope things are starting
to feel pretty comfortable 😀

## Recap of first half of the tutorial

So far, we've been learning how to use React.js—how powerful it is to be able to
create our _own_ components to act as custom building blocks for websites.

We’ve also explored styling components using CSS Modules.

## What's in this tutorial?

In the next four parts of the tutorial (including this one), we'll be diving into the Gatsby data layer, which is a powerful feature of Gatsby that lets you easily build sites from Markdown, WordPress, headless CMSs, and other data sources of all flavors.

**NOTE:** Gatsby’s data layer is powered by GraphQL. For an in-depth tutorial on
GraphQL, we recommend [How to GraphQL](https://www.howtographql.com/).

## Data in Gatsby

A website has four parts, HTML, CSS, JS, and data. The first half of the
tutorial focused on the first three. Let's learn now how to use data in Gatsby
sites.

What is data?

A very computer science-y answer would be: data is things like `"strings"`,
integers (`42`), objects (`{ pizza: true }`), etc.

For the purpose of working in Gatsby, however, a more useful answer is
"everything that lives outside a React component".

So far, we've been writing text and adding images _directly_ in components.
Which is an _excellent_ way to build many websites. But, often you want to store
data _outside_ components and then bring the data _into_ the component as
needed.

For example, if you're building a site with WordPress (so other contributors
have a nice interface for adding & maintaining content) and Gatsby, the _data_
for the site (pages and posts) are in WordPress and you _pull_ that data, as
needed, into your components.

Data can also live in file types like Markdown, CSV, etc. as well as databases
and APIs of all sorts.

**Gatsby's data layer lets us pull data from these (and any other source)
directly into our components**—in the shape and form we want.

## How Gatsby's data layer uses GraphQL to pull data into components

There are many options for loading data into React components. One of the most
popular and powerful of these is a technology called
[GraphQL](http://graphql.org/).

GraphQL was invented at Facebook to help product engineers _pull_ needed data into
components.

GraphQL is a **q**uery **l**anguage (the _QL_ part of its name). If you're
familiar with SQL, it works in a very similar way. Using a special syntax, you describe
the data you want in your component and then that data is given
to you.

Gatsby uses GraphQL to enable components to declare the data they need.

## Our first GraphQL query

Let's create another new site for this part of the tutorial like in the previous
parts. We're going to build a Markdown blog called "Pandas Eating Lots".
It's dedicated to showing off the best pictures & videos of Pandas eating lots
of food. Along the way we'll be dipping our toes into GraphQL and Gatsby's
Markdown support.

Open a new terminal window and run the following commands to create a new Gatsby site in a directory called `tutorial-part-four`. Then change to this new directory:

```shell
gatsby new tutorial-part-four https://github.com/gatsbyjs/gatsby-starter-hello-world
cd tutorial-part-four
```

Then install some other needed dependencies at the root of the project. We'll use the Typography theme
Kirkham + we'll try out a CSS-in-JS library
[Glamorous](https://glamorous.rocks/):

```shell
npm install --save gatsby-plugin-typography gatsby-plugin-glamor glamorous typography-theme-kirkham
```

Let's set up a site similar to what we ended with in Part Three. This site will have a layout
component and two page components:

`src/pages/index.js`

```jsx
import React from "react";

export default () => (
  <div>
    <h1>Amazing Pandas Eating Things</h1>
    <div>
      <img
        src="https://2.bp.blogspot.com/-BMP2l6Hwvp4/TiAxeGx4CTI/AAAAAAAAD_M/XlC_mY3SoEw/s1600/panda-group-eating-bamboo.jpg"
        alt="Group of pandas eating bamboo"
      />
    </div>
  </div>
);
```

`src/pages/about.js`

```jsx
import React from "react";

export default () => (
  <div>
    <h1>About Pandas Eating Lots</h1>
    <p>
      We're the only site running on your computer dedicated to showing the best
      photos and videos of pandas eating lots of food.
    </p>
  </div>
);
```

`src/layouts/index.js`

```jsx
import React from "react";
import g from "glamorous";
import { css } from "glamor";
import Link from "gatsby-link";

import { rhythm } from "../utils/typography";

const linkStyle = css({ float: `right` });

export default ({ children }) => (
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
);
```

`src/utils/typography.js`

```javascript
import Typography from "typography";
import kirkhamTheme from "typography-theme-kirkham";

const typography = new Typography(kirkhamTheme);

export default typography;
```

`gatsby-config.js` (must be in the root of your project, not under src)

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
};
```

Add the above files and then run `gatsby develop` like normal and you should see
the following:

![start](start.png)

We have another small site with a layout and two pages.

Now let's start querying 😋

## Querying for the site title

When building sites, it's common to want to reuse common bits of data across the
site. Like the _site title_ for example. Look at the `/about/` page. You'll
notice that we have the site title in both the layout component (the site
header) as well as in the title of the About page. But what if we want to change
the site title at some point in the future? We'd have to search across all our
components for spots using the site title and edit each instance of the title. This process is both cumbersome and
error-prone, especially as sites get larger and more complex. It's much better to
store the title in one place and then _pull_ that title into components whenever
we need it.

To solve this, we can add site "metadata" — like page title or description — to the `gatsby-config.js` file. Let's add our site title to
`gatsby-config.js` file and then query it from our layout and about page!

Edit your `gatsby-config.js`:

```javascript{2-4}
module.exports = {
  siteMetadata: {
    title: `Blah Blah Fake Title`,
  },
  plugins: [
    `gatsby-plugin-glamor`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
};
```

Restart the development server.

Then edit the two components:

`src/pages/about.js`

```jsx{3,5-7,14-23}
import React from "react";

export default ({ data }) =>
  <div>
    <h1>
      About {data.site.siteMetadata.title}
    </h1>
    <p>
      We're the only site running on your computer dedicated to showing the best
      photos and videos of pandas eating lots of food.
    </p>
  </div>

export const query = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
```

`src/layouts/index.js`

```jsx{10,19,28-33}
import React from "react";
import g from "glamorous";
import { css } from "glamor";
import Link from "gatsby-link";

import { rhythm } from "../utils/typography";

const linkStyle = css({ float: `right` })

export default ({ children, data }) =>
  <g.Div
    margin={`0 auto`}
    maxWidth={700}
    padding={rhythm(2)}
    paddingTop={rhythm(1.5)}
  >
    <Link to={`/`}>
      <g.H3 marginBottom={rhythm(2)} display={`inline-block`}>
        {data.site.siteMetadata.title}
      </g.H3>
    </Link>
    <Link className={linkStyle} to={`/about/`}>
      About
    </Link>
    {children()}
  </g.Div>

export const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
```

It worked!! 🎉

![fake-title-graphql](fake-title-graphql.png)

But let's restore the real title.

One of the core principles of Gatsby is creators need an immediate connection to
what they're creating
([hat tip to Bret Victor](http://blog.ezyang.com/2012/02/transcript-of-inventing-on-principleb/)).
Or, in other words, when you make any change to code you should immediately see
the effect of that change. You manipulate an input of Gatsby and you see the new
output showing up on the screen.

So almost everywhere, changes you make will immediately take effect.

Try editing the title in `siteMetadata`—change the title back to "Pandas Eating
Lots". The change should show up very quickly in your browser.

## Wait — where did the graphql tag come from?

You may have noticed that we used a
[tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals)
called `graphql`, but we never actually _import_ a `graphql` tag. So... how does
this not throw an error?

The short answer is this: during the Gatsby build process, GraphQL queries are
pulled out of the original source for parsing.

The longer answer is a little more involved: Gatsby borrows a technique from
[Relay](https://facebook.github.io/relay/) that converts our source code into an
[abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
during the build step. All `graphql`-tagged templates are found in
[`file-parser.js`](https://github.com/gatsbyjs/gatsby/blob/v1.6.3/packages/gatsby/src/internal-plugins/query-runner/file-parser.js#L63)
and
[`query-compiler.js`](https://github.com/gatsbyjs/gatsby/blob/v1.6.3/packages/gatsby/src/internal-plugins/query-runner/query-compiler.js),
which effectively removes them from the original source code. This means that
the `graphql` tag isn’t executed the way that we might expect, which is why
there’s no error, despite the fact that we’re technically using an undefined tag
in our source.

## What's coming next?

Next, you'll be learning about how to pull data into your Gatsby site using GraphQL with source plugins in [part five](/tutorial/part-five/) of the tutorial.
