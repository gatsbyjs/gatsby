- Start Date: (fill me in with today's date, YYYY-MM-DD)
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

# Summary

Gatsby Recipes is framework for automating common Gatsby tasks. Recipes are MDX
files which when run by our interpretor, perform common actions like installing
NPM packages, installing plugins, creating pages, etc.

It's designed to be extensible so new capabilities can be added which allow
Recipes to automate more things.

We chose MDX to allow for a literate programming style of writing recipes
which enables us to port our dozens of recipes from https://www.gatsbyjs.org/docs/recipes/
as well as in the future, entire tutorials.

# Basic example

Recipes are written in MDX, so a combination of Markdown and React components.
The markdown is instructions and explanations for the React components which
instruct Gatsby Recipes to perform tasks like: `<NPMInstallPackage names={["gatsby-plugin-sass"]} />`.

A full recipe for adding the CSS-in-JS library Emotion looks like the following:

```mdx
# Add Emotion

This recipe helps you start developing with the
Emotion CSS in JS library

<Config name="gatsbyjs/add-emotion" />

---

Installing necessary packages

<NPMPackage
  name={"gatsby-plugin-emotion"}
/>
<NPMPackage
  name={"@emotion/core"}
/>
<NPMPackage
  name={"@emotion/styled"}
/>

---

Adding `gatsby-plugin-emotion` to your `gatsby-config.js`. It provides support
for Emotion during Gatsby's server side rendering.

<GatsbyPlugin name="gatsby-plugin-emotion" />

---

You can now use Emotion in your site!
```

Recipes are run from the CLI like `gatsby recipes gatsby/emotion` or
`gatsby recipes gatsby/google-analytics G-xxxxxxxxxxx`.

You can also run `gatsby recipes` to see a list of available recipes
to select one to run.

Recipes can compose other recipes like the following:

```mdx
Setup my site with my favorite techs

---

Setting up Typescript and ThemeUI.

import Typescript from "gatsby/typescript"

<TypeScript props="can be passed to recipes" />

import ThemeUI from "gatsby/theme-ui"

<ThemeUI />
```

# Motivation

Gatsby has 1000s of plugins and themes & can do an incredible number of things.
With this comes the problem of discovering how to accomplish a specific task.
It's a challenge when entering a new ecosystem to translate "I want to do x" to
how "x" is done there. We've added [dozens of "recipes" to help people with
this on gatsbyjs.org](https://www.gatsbyjs.org/docs/recipes/) and we thought
these would work even better if you could run them directly on the CLI. Recipes
both teach users how things work in Gatsby while also automating setting things
up.

So now, instead of googling how to add Typescript support to Gatsby, you simply
run `gatsby recipes typescript` and an interactive workflow walks you through
adding Typescript.

Similarly if you want to add a blog, you can now run `gatsby recipes add-gatsby-theme-blog` and the recipe will ask you what directory you want to
store the markdown files & the url structure for the pages and you can
immediately start blogging.

# Detailed design

Recipes follows a client/server model. The client can be the web IDE or a CLI
or any other client that implements the server APIs. The client interprets the
recipe's React components in a manner appropriate to the environment.

Servers provide the ability to execute actions. They may provide basic actions
like writing to disk, git operations, npm operations, etc. Providers provide
support for different actions e.g. Gatsby is itself a provider and supports
many Gatsby-specific actions like installing plugins, shadowing theme files,
creating pages, etc. A client can connect to multiple servers so a future
Gatsby Desktop app could provide additional actions like installing a starter,
running `gatsby develop` etc. The client must validate recipes to ensure the
servers provide the necessary capabilities to execute the recipe.

Clients provide a GUI that walk people people through executing recipes. As
recipes are executed, they create actions which are sent to the server to be
executed and the server streams back logs & other progress/completion/error
events. We'll ship clients as React components for both the web and CLI (for
[Ink](https://github.com/vadimdemedes/ink)).

All recipes can be run in two modes — "plan" and "apply". When running
in "plan" mode, the server creates a plan which tells the client what **would**
happen if the recipes were run. This could be anything from creating/updating
files, installing/upgrading packages, installing Gatsby Plugins/themes, setting
up CMSs, etc.

When a plan is applied, the planned changes are then executed.

Typically the plan/apply phases would happen simultaneously as the user runs
recipes but more advanced teams would often separate the two steps as we see
with Terraform and other mature Infrastructure as Code tools.

Recipes for a site are persisted in a `recipes.mdx` file.

# Drawbacks

The main drawback is this is one more thing to learn to use Gatsby. But should
remove the need to learn a lot of other things :-D

Would be happy to hear ideas about potential drawbacks.

# Alternatives

Simple code generators was one potential design but we wished for a lot more power
than they provided e.g. multi-step recipes and the ability to run recipes in both
the client and browser.

# Adoption strategy

This works with existing Gatsby tech — it's a new layer on top of them.

It'll be added to the CLI first for in-the-wild testing and then eventually
get added to the docs and tutorials on gatsbyjs.org

# How we teach this

This potentially could lead to a pretty dramatic reorganization of how
we teach Gatsby in general. This initial release is pretty modest in scope
however so we'll leave exploring that to future RFCs.

# Unresolved questions

There's a lot of open design questions about how recipes should work. Especially
how they'll work across both the CLI & browser environments.
