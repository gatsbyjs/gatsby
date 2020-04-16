---
title: Gatsby Themes Roadmap
date: 2019-03-11
author: Chris Biscardi
excerpt: "Where Gatsby themes are headed in 2019"
tags: ["themes", "content-mesh"]
---

Gatsby themes have come a long way in the last few months. We've iteratively
shipped functionality that has enabled people to ship sites quickly on short
deadline with an absolute minimum (1) of breaking changes. In this post we'll
cover what we've shipped to date, where we are today, and what the roadmap looks
like for where we're going:

1. Theme Composition
2. Component Shadowing 2a. Improving Docs
3. Simplifying the Data Model
4. ?

## Theme Composition

The core theme composition algorithm was the first set of functionality we
worked on. This piece of the code at its core can be thought of as
`Object.assign` for `gatsby-config.js`. Given an array of themes, each
`gatsby-config` is merged into the next. For example, if we have `[themeA, themeB]`, the resulting config is `{ ...themeA, ...themeB }`.

There are also some special considerations for how we merge specific fields of
the `gatsby-config`. `siteMetadata` is merged using [Lodash's deep
merge](https://lodash.com/docs/#merge), allowing users to override fields like
the title of a blog, or the tokens in a design system that are shared across
multiple themes. `plugins` are added together so that each theme's plugins are
represented in the result (`[...themeA.plugins, ...themeB.plugins]`). To allow
the usage of `gatsby-*` lifecycle APIs in themes, we also add each theme as a
plugin itself, resulting in `[...themeA.plugins, themeA, ...themeB.plugins, themeB]`. This results in the theme being able to add functionality on top of
any plugin it includes.

For more on this, read [Introducing Gatsby
Themes](/blog/2018-11-11-introducing-gatsby-themes/).

We introduced one major change to composition after the initial release to
support child themes. A child theme is a theme that also uses the
`plugins` `gatsby-config` key – a change that brought the full power
of `gatsby-config` to theming.

```js:title="a child theme's gatsby-config.js"
module.exports = {
  plugins: [`gatsby-theme-blog-core`],
}
```

Child themes under the hood are implemented by extending the original
composition algorithm to be recursive. This means you can have as many or as few
themes as you want, and that implementing it was _not_ a breaking change for
anyone. One really interesting facet of child themes in Gatsby compared to
anywhere else is the ability to have a tree of themes. In the following example
each theme points to its parents. (So `gatsby-theme-supertheme` references
`gatsby-theme-a` and `gatsby-theme-b` in its `gatsby-config`). We have 7 total
themes and the user only has to know about and install
`gatsby-theme-supertheme`.

```text
gatsby-theme-supertheme
├── gatsby-theme-a
│   ├── gatsby-theme-a1
│   ├── gatsby-theme-a2
│   └── gatsby-theme-a3
└── gatsby-theme-b
    └── gatsby-theme-b1
```

This flexibility allows us to come up with new patterns for abstracting
functionality into themes. Since we're still in the early days we don't know
what best practices will end up being and if you're just getting started its a
good idea to build out a single theme before attempting to build a set of themes
that work together.

## Component Shadowing

The next problem we approached can be described as "How do I change the
navigation component in a theme?".

Composition is useful but if you can't override the way data displays by
changing the rendering, then we are left with fairly inflexible systems. Given
that page templates and other functionality can be changed using Gatsby
lifecycles such as `onCreatePage`, that left us with how to allow arbitrary
changes to how a specific sub-section of the page renders. Component shadowing
came next as the solution to this problem.

Component shadowing is based on the idea that Gatsby sites are built up out of
React components. At any given point in the tree that is your site, you have a
React component (or set of components) responsible for handling the rendering of
some props. This could be low level like a `Text` or `Heading` component, higher
level compositions [like `Media`
objects](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/),
the `Navigation` component, or even a full page layout. Component shadowing
allows you to find the place a component is defined in a theme, such as
`gatsby-theme-blog/src/author.js`, and replace it by creating a file in your
site at `my-site/src/gatsby-theme-blog/author.js`.

In fact, any file that is processed by webpack can be shadowed.

To learn more about child themes and component shadowing, [read this themes
update blog
post](/blog/2019-01-29-themes-update-child-theming-and-component-shadowing/).

## Improving Documentation

After composition and shadowing were released, we focused a bit on fixing any
bugs that popped up and expanding usage to a wider audience. Some companies have
already shipped [child
themes](https://twitter.com/peggyrayzis/status/1095407450424049664) and
[component
shadowing](https://twitter.com/trevorblades/status/1095118425473445888) to
production with impressive results: lowering development time and enabling
development that might not have been able to ship within the necessary timeframe
on other platforms.

We've also written and are updating a set of documentation that will be released
on gatsbyjs.org for anyone that is using or looking to start using themes.

## Simplifying the Data Model

We shipped composition, child themes, and component shadowing and we're not
stopping there. Next up on our plate is something you may have seen us tweeting
about: dealing with data. The GraphQL model Gatsby uses is fantastic for doing
any kind of custom work, which is great for theme creators, but it means that as
a theme user you're often locked into using `MarkdownRemark` when you'd rather
be using `Mdx`.

Currently most of the folks using themes are experienced Gatsby users. As we
start to have more and more themes publicly available, we'll have more and more
newer Gatsby users installing and using them. Offering a simplified data model
that can switch between backing content types means that instead of a theme
tying itself to `MarkdownRemark`, it can tie itself to a generic data type like
`BlogPost` that can be implemented by `MarkdownRemark` under the hood. We could
use these generic data types as an (optional, extensible) target for theme
creators. More creators building around community vetted core types means that
more themes will be able to be swapped in place of one another and more themes
will be compatible composing together. Imagine a blog theme that extends the
core community `BlogPost` type with multi-author support. It would be
immediately compatible with any theme that used the `BlogPost` type.

If you're following closely you may have already seen [a blog post by Mikhail
Novikov](/blog/2019-03-04-new-schema-customization/) on
the new schema customization APIs: `createTypes` and `createResolvers`. These
are the primitives we are using to build data abstractions to use with themes.
We're still experimenting and doing research here so I won't show any code
today. If you want to participate in the development of the data abstraction, I
highly encourage you to install `gatsby@schema-customization` and play around.

## The Future

There are a number of directions we can go from here to give a better user
experience to developing and using themes for experienced Gatsby contributors
and new users alike. Building out potential UX improvements to shadowing for
more complex multi-theme authoring use cases, defining patterns for sharing
design tokens and data abstractions across themes, and building a cohesive set
of themable components for a set of official Gatsby themes are all directions
you may see us together with the community work on in the future.

That's a peek inside where themes is going. Get started building your own themes
today and let us know what you build! Be sure to check back in on the Gatsby
blog this month as we have theming related posts from
[@jlengstorf](https://twitter.com/jlengstorf),
[@4lpine](https://twitter.com/4lpine), and [@jxnblk](https://twitter.com/jxnblk)
coming shortly.
