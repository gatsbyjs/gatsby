---
title: "Themes Update: Child Theming and Component Shadowing"
date: 2019-01-29
author: Chris Biscardi
excerpt: "Making it easier to abstract themes into reusable modules"
tags: ["themes", "architecture"]
---

> _Updated July 9, 2019 to reflect using the `gatsby-plugin-mdx` package instead of the (now deprecated) gatsby-mdx package._

> If you aren't familiar with Gatsby themes yet, then check out [Introducing
> Gatsby
> Themes](/blog/2018-11-11-introducing-gatsby-themes/)
> for a written introduction and [my Gatsby Days
> talk](https://www.youtube.com/watch?v=wX84vXBpMR8) for a more audio/visual
> approach.

# Child Theming

We've merged [a PR](https://github.com/gatsbyjs/gatsby/pull/10787) into Gatsby
core to support Child theming. Child theming is an extension of the core theming
algorithm to support a "parent/child" style relationship where child themes can
rely on parent themes in the same way sites rely on themes. This means you can
now use the `__experimentalThemes` gatsby-config key in a theme as well as your
sites.

This change is being made to make it easier for theme authors to produce themes
that rely on complex behavior while enabling users who have different skill sets
to consume and modify those themes. Theme authors will benefit from the ability
to abstract logic, UI elements, and other Gatsby idioms into multiple packages
which can be consumed as a single theme. Child themes (and themes as a whole)
will improve the ability of people with different skill sets to create
accessible, performant, beautiful sites. A few that I had in mind while building
out child theming are:

- A designer who wants to change a set of design tokens to create a whole new
  look for a theme
- Someone who is more familiar with HTML and CSS than React and GraphQL and
  wants to create a set of child blog themes
- Someone familiar with GraphQL wants to enable new functionality by writing
  their own queries for page templates

We also want child themes to enable an ecosystem to build on top of and compose
with each other. The 80% use case for a blog should be capable of being built on
a similar data model encapsulated in a parent theme so that users can swap out
child themes to try out new sites or new looks. This will take some more effort
to achieve, so more on that at a later date.

## A Concrete Example

Taking advantage of child theming requires some familiarity with theming itself
to be used effectively. If you're already experienced with themes and want to
see how one possible way to upgrade your themes to use this feature, the
corresponding PR in the [gatsby-theme-examples
repo](https://github.com/ChristopherBiscardi/gatsby-theme-examples) has [also
been
merged](https://github.com/ChristopherBiscardi/gatsby-theme-examples/pull/13).

Let's say you have a theme that contains a blog data model and some logic
relating to how to render blog posts at specific pages, we'll call it
`gatsby-theme-blog-core`. This theme renders JSON representations of blog posts
at the relevant page locations instead of full UI because it's only meant to
encapsulate the data model. We'll skip going over page creation logic in
`gatsby-node.js` and instead focus on the following possible `gatsby-config.js`
for the core theme.

```js:title=gatsby-theme-blog-core/gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-mdx`],
}
```

Then we have another theme that handles applying a UI layer using to the core
data model, `gatsby-theme-blog`. This theme is a child theme of
`gatsby-theme-blog-core` and shadows the core theme's modules to render
beautiful posts on each blog using any styling technology we want, like
[Emotion](https://emotion.sh/) or [Sass](https://sass-lang.com/). Again, since
this is a post on child theming itself we'll skip looking at how shadowing is
applied to the parent and focus on one possible child theme `gatsby-config.js`.

```js:title=gatsby-theme-blog/gatsby-config.js
module.exports = {
  __experimentalThemes: [`gatsby-theme-blog-core`],
  plugins: [`gatsby-plugin-emotion`],
}
```

Now that we've composed the original data model (with page creation logic) with
the plugins and shadowed components to build the UI, any user can use our theme
by specifying only the child in their `gatsby-config.js`.

```js:title=my-site/gatsby-config.js
module.exports = {
  __experimentalThemes: [`gatsby-theme-blog`],
}
```

The end result from a theme's composition view is that we apply the parent, then
the child, then the user's site. This opens up a whole host of additional
possibilities as child themes can have multiple parents or compose with each
other. Data models for blogging and ecommerce can be combined into a usable
child theme and distributed as a single npm package. Users don't need to know
your theme is made up of multiple parents.

If we go back to our list of use cases, we can map each of them to a layer in
this theme stack. The designer uses the child theme to make their own site
(passing tokens into the theme config), the person proficient in HTML and CSS
can shadow components from the core theme (using minimal React), and the Gatsby
expert can craft custom data models for their specific use cases to compose with
other models. Each link in the chain supports the next, allowing us to reveal
complexity for people with different skillsets when they need it and not before.

## Component Shadowing

The other major change that has landed is the only breaking change to themes so
far. Based on feedback from the early adopters who have been authoring themes,
we've changed Component Shadowing so that it now applies to the entire `src/`
directory instead of just the `src/components` directory. This change was made
because of two key points of feedback:

1. people had trouble remembering which folders got shadowed
2. people who did remember, also wanted shadowing on templates and other, new
   directories (for example one for design tokens) that didn't belong in
   components

The fix for any currently existing theme users is to move any shadowed
components from `src/components/<theme-name>` to `src/<theme-name>/components`.

## What's next?

We are working on a roadmap post for themes which will give more insight into
the future of theming, how we're approaching stability, and what we're working
on next. Check back on the Gatsby blog to know when that is published.
