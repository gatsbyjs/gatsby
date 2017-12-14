---
title: From WordPress to Developing in React — Starting to See It
date: "2017-10-20"
author: "Benjamin Read"
---

As a frontend designer I've always prided myself on being a HTML and CSS
specialist. My use of JavaScript has been limited to animations and DOM
manipulation. However, at
[Indigo Tree](https://indigotree.co.uk "Indigo Tree: We Build Awesome Websites")
we're branching out from our staple of WordPress and trying different methods of
creating websites with functionality that our clients require, whilst maximising
their budget.

We're also bracing ourselves for what we’re anticipating to be the stormfront of
[Gutenberg](https://wordpress.org/plugins/gutenberg/ "Gutenberg Wordpress plugins")
for our WordPress projects. Once it's included in the WordPress Core, writing
components in JavaScript for the Gutenberg editor will be necessary for every
developer on a project.

So I decided to dive into learning React with a few courses and some
experimentation. I had the aim of building a site in
[Gatsby.js](/ "Blazing-fast static site generator for React")
as a test for doing projects built entirely in React.

## Letting Go

The first thing I had to do while investigating React was to let go of some
preconceived ideas I had - that JSX is just plain weird, that JSS (JavaScript
Stylesheets) was an unnecessary abstraction. So I tried not to be bothered by
the templating weirdness too much and embrace the differences. My classes soon
became `classNames`s, my `<a>` tags became `<Links>`, and I quickly saw what
people had been enthusing about.

Managing everything in one place is such a cathartic experience.

With WordPress templating, I used to have function files, filter files, template
files, and SASS partials, often with similar names, depending on the framework
I'd be using. To build a site meant needing to buffer the entire project in my
short-term memory. Not an easy feat to manage.

And then you would complete a project, and forget it all entirely. Until it went
to the client...

Every time a client returned with a last-minute change, I would open up the code
(which I might not have touched for weeks or months), and try to grok what
function lived where, or what I had called that SASS partial. Even with the help
of browser dev tools, this can be really annoying.

Now with Gatsby and React, I have my logic in one language, and in a way that
makes groking easier. I have my layout, template and config modules at hand in
the folder structure, without duplication.

```js
import React from "react";
// Template for blog page
export default ({ data }) => {
  const post = data.markdownRemark;
  return (
    <div>
      <h1>{post.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  );
};
// The data query
export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        type
      }
    }
  }
`;
```

Whilst this might _look_ weird, it actually makes it much easier to understand
what’s going on. You know you’re dealing with this data, using this HTML, and
with CSS-in-JS strategies such as Styled Components, you can see exactly what
CSS is going to be implemented too. In one file.

Beautiful.

## GraphQL: SQL-like data queries

One thing I particularly love about Gatsby.js is its inclusion of
[GraphQL](http://graphql.org/ "A query language for your API"). Like SQL, you
use GraphQL to query your data, whether from the WordPress API, Contentful or
Markdown, and extract a dataset to display in your template.

This approach to data is really adaptable. I love the fact that you can install
a plugin and query your API endpoints with such ease.

Gatsby.js comes with GraphiQL, which is a simple web-based IDE so you can query
your data and get back examples of content immediately. You can then copy this
query into your React module and get back the information you need, whether it's
the title, content, featured image, categories or any other frontmatter you
might have set up.

```js
export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        type
      }
    }
  }
`;
```

Aside from those pesky tick characters, which are sometimes hard to spot for a
newbie, I think this is a great tool, and has sped up my development a
significant amount.

## CSS in JS

This is the thing that I found hardest about React. I've tried 3 methods so far,
and don't really love any of them.

However, since I'm managing my HTML with JavaScript, why not CSS as well? As
above, having everything in one place simplifies the workflow and allows you to
focus on context without having to grok SCSS again, reducing mental friction.

## My Project

Following the [tutorial on Gatsbyjs](/tutorial/) I built
up my project from scratch, breaking things profusely at first, but it honestly
didn’t take long to gain confidence enough so that I launched my first site at
[freebabylon5.com](https://freebabylon5.com "Our last, best hope of getting back on the air")
recently.

Be warned: the tutorial isn’t quite finished yet, you might be better off
starting with
[one of the starter kits already available](/docs/gatsby-starters/),
so that you get `react-helmet` and active links implemented, the 2 things I had
to learn independently.

## The Way Forward?

My initial concerns around using a JavaScript framework such as React seem to
have all been allayed. With server-side React, we no longer have a dependency on
frontend JavaScript, so progressive enhancement is not just a possibility but a
standard. There's momentum towards better accessibility, and for me as a
developer, the tools are there (such as Babel, Chrome Dev Tools React extension,
and others) for a faster, more efficient development experience.

I'm glad to say I'm sold on the idea and methods of developing with JavaScript,
and React in particular. The site I've re-built from WordPress into Gatsby.js is
now live at
[https://freebabylon5.com](https://freebabylon5.com "Our last, best hope of getting back on the air").

Together with my colleagues at
[Indigo Tree](https://indigotree.co.uk "Indigo Tree: We Build Awesome Websites")
we’re now looking at using WordPress as a backend, where clients can edit their
content without the worries of insecure plugins or other methods of being
hacked.

Using GatsbyJS with its “Bring Your Own Data” strategy makes perfect sense, and
we’re about to start building our first Gatsby client site using the plugin
[`gatsby-source-wordpress`](/packages/gatsby-source-wordpress/ "WordPress content into Gatsby")
to pull in our data and build a totally secure website with some pretty
impressive gains on loading time. We’ll also sleep better at night knowing
insecurities in WordPress are no longer putting our clients at risk.

The web is always changing. And the way forward isn't always easy to see. Now,
with GatsbyJS, we're beginning to feel like we can visualise where things are
going.
