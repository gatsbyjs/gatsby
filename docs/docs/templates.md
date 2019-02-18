---
title: Docs templates
---

1.  [Why use templates?](#why-use-templates)
2.  [Guide](#guide)
    - [Guide template](#guide-template)
3.  [Guide overview](#guide-overview)
    - [Guide overview template](#guide-overview-template)
4.  [Tutorial](#tutorial)
    - [Tutorial template](#tutorial-template)
5.  [Plugin READme template](#plugin-readme-template)
6.  [Starter READme template](#starter-readme-template)

## The Gatsby Way(TM) of writing guides

### Why use templates?

Here are templates (models) to follow when contributing to Gatsby docs to ensure that the docs accomplish their purpose. If you have a good reason to deviate from the following template structures, mention those reasons in the PR so others can give proper feedback.

## Guide

### What are guide articles?

Guide articles are found under the "Guides" category in the docs.

### Near-perfect example of a guide article

[Add a 404 page](/docs/add-404-page/) is an example of a guide that isn't perfect yet. As you read through this template, take note of where that article can be improved.

### What should a guide article be about?

We need guide articles to describe every task you can accomplish with Gatsby.

Each guide article should explain exactly one task and that task should be
apparent from the article's title.

#### What if I want to include multiple tasks and concepts in a guide article?

If you find yourself wanting to include multiple related topics in one article, consider splitting each into its own individual guide and referencing the other topics under sections called “Prerequisites” and/or "Other
Resources" sections in the related guide articles.

It’s more ideal to have many articles that cover a broad range of technical topics rather than smashing too many topics into one article.

If you find yourself wanting to teach the reader how to accomplish a series of related tasks, you might want to write a tutorial.

#### When to write a guide vs. a tutorial?

A guide explains a discrete task without the step-by-step context provided by a tutorial.

Guides cover the smallest possible topic, while tutorials can cover a series of related tasks that you string together.

#### How to choose a guide article topic?

Topics should be chosen based on these priorities:

1.  Stub articles (already exist on the site but just don't have content in them yet)
2.  Articles requested in the In Progress epics in GitHub Zenhub
3.  Articles requested in the Roadmap in GitHub Zenhub
4.  Articles that you or other community members would like to see

### Length of a guide

Ideally, a guide fits above the fold on the computer screen. This means the entire guide is visible at one glance, so the person viewing the screen doesn't need to scroll to view the whole guide.

If it needs to extend beyond the fold, try to keep it to the length of a piece of 8.5x11" paper (standard US paper size). This is a somewhat arbitrarily chosen standard that will nevertheless help us keep guides short, consistent, and printable should anyone ever want to print a Gatsby book :)

### Guide template

You can copy and paste the markdown text below and fill it in with your own information

```markdown
---
title: Querying Data with GraphQL
---

### Introductory paragraph

The introductory paragraph should be a 1-2 sentence explanation of the main
topic and answer the following question:

What is the purpose of this guide?

### Prerequisites (if any)

If applicable, list any prerequisites to reading and understanding your article. Does the reader need to read another document first, install a particular plugin, or already know a certain skill? List those things here.

### The facts

What are the facts you know about the topic of this guide?

Keep paragraphs short (around 1-4 sentences). People are more likely to read
several short paragraphs instead of a huge block of text.

### Example

Readers will likely use doc articles as a quick reference to look up syntax.
Articles should have a basic, real-world example that shows common use cases of its syntax.

Provide at least one example of how the task gets accomplished. A code snippet is ideal, in this format:

    code snippet

//See this [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code) on how to format code examples

### Gatsby advantages

Does Gatsby address this topic uniquely in some way? If so, state the unique advantages Gatsby provides to the user.

If there are disadvantages Gatsby has, state those here as well and any known bugs or issues the Gatsby community is working on.

### Other resources

If there are other resources you think readers would benefit from or next steps they might want to take after reading your article, add
them at the bottom in an "Other Resources" section. You can also mention here any resources that helped you write the article (blogposts, outside tutorials, etc.).

- Link to a blogpost
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```

## Guide overview

### Near-perfect example of a guide overview

[Deploying and Hosting](/docs/deploying-and-hosting/)

### What should a guide overview be about?

Each overview should give a short overview of its section of the guides and ideally fit “above the fold” (the reader can see the whole guide overview article on desktop without scrolling).

The goal: by skimming over the list of guide overview articles, a person new to Gatsby should get a good overview of what functionality Gatsby is capable of and what they can accomplish with Gatsby.

### Length of a guide overview article

Ideally, a guide overview fits above the fold on the computer screen, which means the entire guide is visible in one glance, so the person viewing the screen doesn't need to scroll to view the whole guide.

If it needs to extend beyond the fold, try to keep it to the length of a piece of 8.5x11" paper (standard US paper size). This is a somewhat arbitrarily chosen standard that will nevertheless help us keep guides short, consistent, and printable should anyone ever want to print a Gatsby book :)

### When should I create a new guide overview article?

Guide overview articles are essentially new parent categories that help organize all the guide articles. Here’s how to decide if you should create a new guide overview article:

1.  Stub articles (already exist on the site but just don't have content in them yet)
2.  Articles requested in the In Progress epics in GitHub Zenhub
3.  Articles requested in the Roadmap in GitHub Zenhub
4.  Articles that you or other community members would like to see

## Guide overview template

You can copy and paste the markdown text below and fill it in with your own information

```markdown
---
title: Testing
overview: true
---

## title: Testing

## Section overview

The section overview should be a 2-5 sentence explanation of the category and answer the following questions:

- What is the main purpose of this section in the docs?

## Prerequisites (if any)

Assume the reader has basic programming knowledge like the command line, code editors, and beginning familiarity with React and GraphQL concepts. Beyond that assumed knowledge, list any other prerequisites to reading and understanding your article. Does the reader need to read another document first, install a particular plugin, or already know a certain skill? List those things here.

## Guides in this section

[[guidelist]]

## Other resources

- Link to a blogpost
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```

---

## Tutorial

### Near perfect example of a tutorial

[Main Gatsby tutorial](https://www.gatsbyjs.org/tutorial/)

### What should a tutorial be about?

We need tutorials to explain how to perform a series of related tasks with Gatsby.

### When to write a guide vs. a tutorial?

A guide explains a discrete task without the step-by-step context provided by a tutorial.

Guides cover the smallest possible topic, while tutorials can cover a series of related tasks that you string together.

### How to choose a tutorial topic?

Topics should be chosen based on these priorities:

1.  Stub articles (already exist on the site but just don't have content in them yet)
2.  Tutorials requested in the In Progress epics in GitHub Zenhub
3.  Tutorials requested in the Roadmap in GitHub Zenhub
4.  Tutorials that you or other community members would like to see

## Length of a tutorial

If a tutorial is longer than 3 8.5x11” pages or has more than about 5 headers and you’re finding yourself creating a Table of Contents at the top, it will probably be easier to read and easier for readers to complete if you turn it into a multi-page tutorial, like the [main Gatsby tutorial](https://www.gatsbyjs.org/tutorial/).

If you have a tutorial that falls into this category, it is likely a big enough project that you’ll benefit from the feedback process provided by creating an [RFC (Request for Comments) document](https://github.com/gatsbyjs/rfcs).

## Tutorial template

You can copy and paste the markdown text below and fill it in with your own information.

```markdown
---
title: Title
---

## title: How to create a decoupled Drupal site with Gatsby

## What’s contained in this tutorial?

By the end of this tutorial, you’ll have done the following:

- learned how to **\_\_**
- built a \***\*\_\*\***
- used a **\_\_\_** with Gatsby

## Prerequisites (if any)

If applicable, list any prerequisites to reading and understanding your tutorial. Does the reader need to read another document first, install a particular plugin, or already know a certain skill? List those things here.

## Step 1

Keep paragraphs short (around 1-4 sentences). People are more likely to read
several short paragraphs instead of a huge block of text.

Readers will likely use doc articles as a quick reference to look up syntax.
Articles should have a basic, real-world example that shows common use cases of its syntax.

    code example

//See this [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code) on how to format code examples

## Step 2

Repeat the pattern found in step 1

## Step 3

Repeat the pattern found in other steps the other steps

## Step _n_

Include as many steps as you need. If there are more than 5-10 steps, it might be worth considering a multi-page tutorial to make it easier for the people to finish chunks of the tutorial.

## What did you just do?

In this tutorial, you did the following:

- learned how to **\_\_**
- built a \***\*\_\*\***
- used a **\_\_\_** with Gatsby

## What’s next

If there are more parts to the tutorial, link to the next step here.

## Other resources

If there are other resources you think readers would benefit from or next steps they might want to take after reading your article, add
them at the bottom in an "Other Resources" section. You can also mention here any resources that helped you write the article (blogposts, outside tutorials, etc.).

- Link to a blogpost
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```

---

## Plugin READme template

### Near-perfect example of a plugin READme

`[gatsby-source-filesystem]`(/packages/gatsby-source-filesystem/)

```markdown
## Description

Include a summary of what this plugin accomplishes. Is there a demo site that shows how this plugin operates? If so, include a link to the deployed demo site and/or its src code here.

### Dependencies (optional)

Are there any plugins that must be installed in order to make this plugin work, please include a list of those plugins and links to their pages here.

### Learning Resources (optional)

If there are other tutorials, docs, and learning resources that are necessary or helpful to someone using this plugin, please link to those here.

## How to install

Please include installation instructions here.

## Available options (if any)

## When do I use this plugin?

Include stories about when this plugin is helpful and/or necessary.

## Examples of usage

This usually shows a code example showing how to include this plugin in a site's `config.js` file.

    code example

//See this [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code) on how to format code examples.

This section could also include before-and-after examples of data when the plugin is enabled, if applicable.

## How to query for data (source plugins only)

If this is a source plugin READme, source plugins ought to allow people to query for data within their Gatsby site. Please include code examples to show how to query for data using your source plugin.

## How to run tests

## How to develop locally

## How to contribute

If you have unanswered questions, would like help with enhancing or debugging the plugin, it is nice to include instructions for people who want to contribute to your plugin.
```

---

## Starter READme template

### Near-perfect example of a starter READme

[Default Starter READme](https://github.com/gatsbyjs/gatsby-starter-default)

```markdown
## Name of starter

## Quick start

Give instructions on how to install this starter

## Features

Tell features comes with this starter. This is a chance to give users a brief tour of how to use this starter effectively.

## Next steps

Any tips on how to deploy this starter? What CMS to use? Other fun ways to build on top of the starter? Say those here!
```
