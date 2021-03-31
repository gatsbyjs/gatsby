---
title: How to Write a Reference Guide
---

## What are reference guide articles?

Reference Guides are technical descriptions of how Gatsby works. The goal of a Reference Guide is to **describe** a Gatsby concept or tool and when to use it. Reference Guides might cover topics like API references, configuration options, or built-in React components.

Key features of a Reference Guide:

- Goal: Describing
- Most useful when: in working mode
- Theoretical knowledge
- A Reference Guide isn't meant to be read from start to finish. Instead, it's meant to be used by developers who are actively working on a project and need to look up some details about how a particular Gatsby feature works.
- It doesn't provide the step-by-step context you might expect from a [How-To Guide](/contributing/docs-contributions/how-to-write-a-how-to-guide) or [Tutorial](/contributing/docs-contributions/how-to-write-a-tutorial).

You can think of a Reference Guide as an encyclopedia page. It describes what the feature is and when it might be useful, but it won't walk you through the whole process of setting it up for yourself.

## Near-perfect example of a Reference Guide

[Reference Guide: Gatsby Image plugin](/docs/reference/built-in-components/gatsby-plugin-image/)

## Tips for writing a Reference Guide

- Reference material should list text headings for each section of a guide, rather than "steps 1-5" like a tutorial.
- include examples (esp showing how to import!)

## What should a reference guide be about?

We need guide articles to describe every concept and task you can accomplish with Gatsby.

Each guide article should explain exactly one concept and that concept should be apparent from the article's title. [Overview guides](#reference-guide-overview) can list child pages to present multiple ways of getting a job done while limiting the scope of each individual article (e.g. Styling Your Site, Using Layout Components, Standard Global CSS Files, etc.)

## Near-perfect example of a reference guide

[Linking Between Pages](/docs/linking-between-pages/)

## What if I want to include multiple tasks and concepts in a reference guide?

If you find yourself wanting to include multiple related topics in one article, consider splitting each into its own individual guide and referencing the other topics under sections called “Prerequisites” and/or "Other Resources" sections in the related guide articles.

It’s more ideal to have many articles that cover a broad range of technical topics rather than smashing too many topics into one article.

If you find yourself wanting to teach the reader how to accomplish a series of related tasks, you might want to write a tutorial. For short and super common how-to instructions for a single task, a recipe may work best.

## When to write a reference guide vs. a tutorial, vs. a recipe?

[Reference guide articles](#reference-guide-template) cover discrete topics as documentation while linking to other resources and guides. A reference guide explains a task or concept without the step-by-step context provided by a tutorial or recipe.

[Tutorials](/contributing/how-to-write-a-tutorial) guide users through a series of related tasks they can string together successfully. Listing prerequisites up front and limiting distractions or links away from the instructions can make a focused tutorial.

[Recipes](/contributing/how-to-write-a-recipe) are a happy medium between step-by-step tutorials and crawling the full reference guides, by providing step-by-step guidance for short, common Gatsby tasks. They live in the Recipes section of the docs.

## How to choose a reference guide topic?

Guide topics should be chosen based on these priorities:

1. [Stub articles](/contributing/stub-list/) (docs that already exist on the site but don't have content in them yet)
2. Articles with the [help wanted and type:documentation](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22+label%3A%22type%3A+documentation%22) labels on GitHub
3. Articles related to improving [key learning workflows](https://github.com/gatsbyjs/gatsby/issues/13708)
4. Articles that you or other community members would like to see

### Length of a reference guide

Ideally, a guide's table of contents would fit above the fold on a desktop computer screen. This means the outline is easily consumable, so the person can quickly determine if that section of the docs contains the information they need to complete a task.

The content of a reference guide should provide just enough information to be actionable. Linking out to other materials and guides outside of Gatsby's core concepts is recommended to limit the scope to critical and unique parts of Gatsby development.

## Reference guide template

You can copy and paste the markdown text below and fill it in with your own information. See the docs contributions guide for information about [structuring accessible headings](/contributing/docs-contributions#headings).

```markdown
---
title: Querying Data with GraphQL
---

## Introductory paragraph

The introductory paragraph should be a 1-2 sentence explanation of the main
topic and answer the following question:

What is the purpose of this guide?

## Prerequisites (if any)

If applicable, list any prerequisites to reading and understanding your article. Does the reader need to read another document first, install a particular plugin, or already know a certain skill? List those things here.

## The facts

What are the facts you know about the topic of this guide?

Keep paragraphs short (around 1-4 sentences). People are more likely to read
several short paragraphs instead of a huge block of text.

## Example

Readers will likely use doc articles as a quick reference to look up syntax.
Articles should have a basic, real-world example that shows common use cases of its syntax.

Provide at least one example of how the task gets accomplished. A code snippet is ideal, in this format:

    code snippet

//See this [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code) on how to format code examples

## Gatsby advantages

Does Gatsby address this topic uniquely in some way? If so, state the unique advantages Gatsby provides to the user.

If there are disadvantages Gatsby has, state those here as well and any known bugs or issues the Gatsby community is working on.

## Other resources

If there are other resources you think readers would benefit from or next steps they might want to take after reading your article, add them at the bottom in an "Other Resources" section. You can also mention here any resources that helped you write the article (blog posts, outside tutorials, etc.).

- Link to a blog post
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```

## Reference guide overview

### Near-perfect example of a guide overview

[Deploying and Hosting](/docs/deploying-and-hosting/)

### What should a reference guide overview be about?

Each overview should give a short introduction of its section of the guides and list the relevant subtopics.

### Length of a reference guide overview

Ideally, a guide overview fits above the fold on a desktop computer screen. This means the outline is easily consumable, so the person can quickly determine if that section of the docs contains the information they need to complete a task.

### When should I create a new reference guide overview?

Guide overview articles are essentially new parent categories that help organize all the reference guides. Here’s how to decide if you should create a new reference guide overview:

1. [Stub articles](/contributing/stub-list/) (docs that already exist on the site but don't have content in them yet)
2. Article sections with the [help wanted and type:documentation](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22+label%3A%22type%3A+documentation%22) labels on GitHub
3. Article sections related to improving [key learning workflows](https://github.com/gatsbyjs/gatsby/issues/13708), like "e-commerce"
4. Article sections that you or other community members would like to see

## Reference guide overview template

You can copy and paste the markdown text below and fill it in with your own information

```markdown
---
title: Section Title
---

The section overview should include a 2-5 sentence explanation of the category and answer the following questions:

- What is the main purpose of this section in the docs?

## Prerequisites (if any)

Assume the reader has basic programming knowledge such as the command line, code editors, and beginning familiarity with React and GraphQL concepts. Beyond that assumed knowledge, list any other prerequisites to reading and understanding your article. Does the reader need to read another document first, install a particular plugin, or already know a certain skill? List those things here.

<GuideList slug={props.slug} />

## Other resources

- Link to a recipe
- Link to a blog post
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```
