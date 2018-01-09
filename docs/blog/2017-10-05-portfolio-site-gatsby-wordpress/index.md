---
title: "Rebuilding my portfolio website with the great GatsbyJS and WordPress"
date: "2017-10-05"
image: "gatsby-article-cover-image.jpg"
author: "David James"
excerpt: "Recreating my WordPress portfolio site using GatsbyJS, React and the WordPress REST API"
---

_This article was originally published on
[my portfolio site](http://dfjames.com/blog/site-generating-with-the-great-gatsbyjs)
on October 1, 2017._

# Site generating with the great GatsbyJS

When someone mentions static site generation, many people think of
[Jekyll](https://jekyllrb.com/). I had heard some good things about it and
noticed it would allow me to build a blog quite easily. I was eager to learn
something new and get something up and running that was more than just my usual
WordPress theme. I was on the verge of rebuilding my portfolio site until a
certain [Scott Tolinski](https://www.youtube.com/user/LevelUpTuts) released a
video on
[GatsbyJS](https://www.youtube.com/watch?v=b2H7fWhQcdE&feature=youtu.be).

[GatsbyJS](/) is a static site generator, similar to Jekyll, however it is
written using [React](https://reactjs.org/) and allows you to write your pages
as React components! It is somewhat similar to create-react-app where almost all
the scary Webpack config has been abstracted away from you and everything is
setup ready to go, so you can get to the important stuff like...building the
site! (If you are a fan of React and not convinced, the
[React website/docs](https://reactjs.org/) were just released using Gatsby!)

I currently work for a [digital agency](http://chromatix.com.au) where we create
custom built [WordPress](https://wordpress.org/) sites from scratch. I have been
working here for almost 2 years and have only got to use React a few times, and
never with WordPress unfortunately. The Gatsby project caught my eye because I
wanted to create a site that was modern, fast, had blog capabilities, and gave
me the opportunity to learn some more React and JavaScript. Another reason I
ended up going with Gatsby was the promise that your project could be connected
to various APIs or even a CMS of your choice.

## The magic of GraphQL and Gatsby Plugins

Originally, following Scott's and the official Gatsby tutorial, I had it pulling
my content from good ol' Markdown files. Then I saw it... too good to be true,
the mention of connecting it to WordPress... I have been writing WordPress
themes for almost 2 years now, so naturally this got me super excited. To have
my back-end as WordPress (including
[ACF](https://www.advancedcustomfields.com/)) and the front-end in React… I had
found the perfect place to test my front-end abilities.

I was skeptical at first: would I have to parse large amounts of JSON to get the
data I needed? I have never even interacted with the WordPress REST API, how
will I query it?

The answer... [GraphQL](http://graphql.org/). Gatsby ships with it and through
an npm install of a
[gatsby-source plugin](/docs/plugins/) of your choice
and a tiny bit of a config, you can start querying in no time. I was amazed with
how simple queries are using GraphQL. You look at them and you go "Huh, that's
it? Really?". Gatsby even ships with an in-browser query tester so you can see
exactly what data you are getting from your GraphQL queries. Wanna sort those
blog posts by date? No problem, just add a flag.

With very little configuration and the installation of a single plugin on my
WordPress site, I began creating pages and pulling data from them using a simple
GraphQL schema. Here is an example of my Projects page which includes pulling
some ACF fields which were originally defined in my Projects page template:

```js
// Pull the project page content from Wordpress
export const projectsPageQuery = graphql`
  query projectsPageQuery {
    wordpressPage(slug: { eq: "projects" }) {
      id
      title
      content
      childWordpressAcfField {
        internal {
          content
        }
      }
    }
  }
`;
```

Pulling blog posts was even easier! If you’d like to sort them by date, ID,
title etc. you just add a simple flag to the query like so:

```js
// Sort WordPress posts by date
export const postQuery = graphql`
  query getPostQuery {
    allWordpressPost(sort: { fields: [date] }) {
      edges {
        node {
          id
          title
          excerpt
          slug
          date
        }
      }
    }
  }
`;
```

## Wrap up and future

In just a few weekends I managed to rebuild my portfolio site with the blog I
wanted. I'd highly recommend [Gatsby](/tutorial/) for
anyone who has started getting acquainted with React. Before I started this
project I didn't know a lot about:

* Static site generation/JAMstack
* Creating a Progressive Web App (PWA) and what qualifies as one
* React Router
* GraphQL
* WordPress REST API

Moving forward with Gatsby, I'd like to extend my site to include pagination
within the blog, use [Styled Components](https://www.styled-components.com/) and
ensure the site scores a 90+ overall on
[Lighthouse](https://developers.google.com/web/tools/lighthouse/), Google’s
performance auditing tool.

Another goal is for my team to start using it with client sites, as the sheer
performance out of the box is amazing. My original WordPress (PHP based theme)
was scoring around 70 for Performance, however without any optimizations, my
Gatsby based site scored 94. Later it scored 99 with some minor optimizations.
We have recently had many clients ask for highly performant websites and
Progressive Web App’s. Gatsby will be perfect to bridge the gaps between
WordPress and React and allow my team to achieve these goals with ease.
