---
title: How to Write a Reference Guide
---

## What is a Reference Guide?

A Reference Guide is a nitty-gritty technical description of how some piece of Gatsby works. Reference Guides are most useful when you need detailed information about Gatsby's APIs or internals.

Reference Guides contain information that many developers would expect to find in technical documentation: function descriptions, parameters and default values, component properties. The Reference Guides section of the docs also includes the [Release Notes](/docs/reference/release-notes/) for each version of Gatsby.

Reference Guides work well for describing the nuts and bolts of how to use a Gatsby feature. You can think of a Reference Guide as an encyclopedia article about a specific plant. It lists details like the plant's defining characteristics, where it can be found, how it can be used. It might also include warnings about potential side effects.

A Reference Guide isn't meant to be read from start to finish. Rather, it's meant to be used by developers who are actively working on a project and need to look up some details about how a particular Gatsby feature works. It might include code examples to show how to use a feature in context, but it doesn't provide a full step-by-step process like what you'd expect from a [How-To Guide](/contributing/docs-contributions/how-to-write-a-how-to-guide) or [Tutorial](/contributing/docs-contributions/how-to-write-a-tutorial)

> For more information on Reference Guides, check out the [Divio documentation system](https://documentation.divio.com/reference-guides/), which the Gatsby docs are based on.

## Near-perfect example of a Reference Guide

[Reference Guide: Gatsby Image plugin](/docs/reference/built-in-components/gatsby-plugin-image/)

## Tips for writing a Reference Guide

- Reference material should list text headings for each section of a guide, rather than "steps 1-5" like a tutorial.
- include examples (esp showing how to import!)

## What if I want to include multiple tasks and concepts in a reference guide?

If you find yourself wanting to include multiple related topics in one article, consider splitting each into its own individual guide and referencing the other topics under sections called “Prerequisites” and/or "Other Resources" sections in the related guide articles.

It’s more ideal to have many articles that cover a broad range of technical topics rather than smashing too many topics into one article.

If you find yourself wanting to teach the reader how to accomplish a series of related tasks, you might want to write a tutorial. For short and super common how-to instructions for a single task, a recipe may work best.

### Length of a reference guide

Ideally, a guide's table of contents would fit above the fold on a desktop computer screen. This means the outline is easily consumable, so the person can quickly determine if that section of the docs contains the information they need to complete a task.

The content of a reference guide should provide just enough information to be actionable. Linking out to other materials and guides outside of Gatsby's core concepts is recommended to limit the scope to critical and unique parts of Gatsby development.

## Reference Guide template

The structure of each Reference Guide will be slightly different, but they should have at least the following sections:

- **Introduction:** The first section. Provide some quick background information to help readers understand 1) what this feature is (at a high level) and 2) why it's useful.
- **Additional Resources:** The last section. Links to other docs or content that might be useful next steps for readers. Also, any resources that helped you write the Reference Guide.

You can copy and paste the markdown text below and fill it in with your own information. See the docs contributions guide for information about [structuring accessible headings](/contributing/docs-contributions#headings).

```markdown
---
title: Feature Name
---

## Introduction

The introductory paragraph should be a 1-2 sentence explanation of the main
topic and answer the following question:

What is the purpose of this guide?

## Feature Name

- Code examples
  - Include all necessary imports!
  - Introduce the example with a sentence describing what the code does and which parts the reader should pay particular attention to.
- List of parameter options, including:
  - Description of what it does
  - Data type
  - Default value

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
