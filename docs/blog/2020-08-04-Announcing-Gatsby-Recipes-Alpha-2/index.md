---
title: "Announcing Gatsby Recipes Alpha 2"
date: 2020-08-04
author: "Kyle Mathews"
excerpt: "After first releasing Recipes in April, we learned a lot from early adopters, testers and community members creating and contribtuing their own Recipes (thanks!) for automating common Gatsby site building chores. In this second alpha release we applied these lessons as we completely rewrote many parts of Recipes to better fulfill our vision of making Gatsby super easy to use, even for beginners."
tags: ["gatsby-inc", "releases", "gatsby-cloud"]
---

I'm excited to announce the second alpha of Gatsby Recipes!

In [April we released our first alpha](/blog/2020-04-15-announcing-gatsby-recipes/) version of Recipes, a new command line tool for automating common site building tasks. We learned a lot from all the early adopters and testers (thanks!), plus those contributing their own home-cooked Gatsby Recipes. In this second alpha release we have incorporated these lessons as we completely rewrote many parts of Recipes to better fulfill our vision.

This is fitting because, ultimately, Recipes are about wish fulfillment. People turn to Gatsby with requests like:

- I want to create a site with data from Airtable
- I want Tailwind installed & set up
- I want an e-commerce site powered by Shopify

Recipes are the way to easily grant such wishes by automating all the setup behind these necessary but tedious tasks so creators can just get busy, well, _creating_.

## Our vision

When designing Recipes, we've borrowed a lot of the ideas from the world of [Infrastructure as Code](/docs/glossary/infrastructure-as-code/). Like today's cloud native applications, websites are now modular: assembled from a collection of cloud services like headless CMS, e-commerce, auth, build, function, and CDN infrastructure. Recipes let you define and manage your infrastructure through normal React code patterns you're familiar with -- but in an interactive and automated way.

Like WordPress, **we want Gatsby to have its own famous 5 minute install**. Whatever combination of resources your site needs, from npm packages to Gatsby plugins to external cloud services, Recipes will provision and configure it for you, automatically, in a few short minutes.

You'll be able to choose from official Recipes that are [part of Gatsby core](/docs/recipes/#new-automated-recipes-available), or browse the abundance of community-written Recipes -- and choose different ones to develop your own cookbook to fit your organization's needs.

What did we focus on for this release?

### 1. Making Recipes "React for web infrastructure"

The initial version only supported "static" components — you couldn't write code to ask the user for input, to pull data from remote sources, etc. This release adds initial basic support for making Recipe components fully dynamic.

The following is an example of what’s now possible. The Recipe defines data and loops over them to define GitHub project columns & labels for the project. For the moment the data must be hard coded but in future releases, we’ll support fetching that data from an API.

```MDX
export const labels = [
  { color: 'tomato', description: '1' },
  { color: 'tomato', description: '2' },
  { color: 'tomato', description: '3' },
  { color: 'tomato', description: '4' }
]
export const projectColumns = [
  'backlog',
  'up next',
  'in progress',
  'in review',
  'done'
]
<GithubRepo name="johno/super">
  <GithubProject name="kanbannnnn">
    {projectColumns.map((col) => (
      <GithubProjectColumn key={col} name={col} />
    ))}
  </GithubProject>
  {labels.map((label) => (
    <GithubLabel key={label.description} {...label} />
  ))}
</GithubRepo
>
```

Read [John Otander's blog post for a deeper dive on this change.](https://johno.com/recipes-interpreter/)

### 2. A `--develop` mode for writing recipes with hot reloading

With the new version, when you run a recipe with the `--develop` flag, the recipe server will watch your recipe and hot reload the terminal output when you make edits.

https://twitter.com/kylemathews/status/1286080826204020736

### 3. Support for running recipes in CI

The initial release was interactive — it'd walk you through each step of running a Recipe. Unfortunately this made it impossible to run the Recipes in CI or in other automated environments...so we fixed it.

You now run Recipes like this: `gatsby recipes ./my-recipe.mdx --install`

## What’s coming next?

For our recent Gatsby Days, we demo'ed a much-requested feature: support for Recipes which ask the user for input. This plus integration of Recipes into Admin will be launched soon.

https://youtu.be/0ZrhTTxfHyc

We were genuinely excited to ship the first version of Recipes, and we are even more excited now to release these improvements. The Gatsby developer experience is a prime directive for our work, and we want to make setting up and maintaining sites a lot lot easier (not to mention even sorta fun).

First we set out to make Gatsby 1000x faster -- and succeeded. Now we are working hard at making Gatsby 1000x easier to use. Recipes were a significant first step towards adding a lot more automation capabilities to Gatsby, and we have a lot of new tools and features on the way to build on this foundation.

## Get cooking

Try out recipes today! Install the latest version of `gatsby-cli` and gatsby to [try out Recipes Alpha II](/docs/recipes/):

```shell
npm install -g gatsby-cli@latest
npm install gatsby@latest
```

To stay current with future developments, follow the [Gatsby Recipes umbrella issue](https://github.com/gatsbyjs/gatsby/issues/22991).
