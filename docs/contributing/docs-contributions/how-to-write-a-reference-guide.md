---
title: How to Write a Reference Guide
---

## What is a Reference Guide?

A Reference Guide is a nitty-gritty technical description of how some piece of Gatsby works. Reference Guides are most useful when you need detailed information about Gatsby's APIs or internals.

Reference Guides contain information that many developers would expect to find in technical documentation: function descriptions, parameters and default values, component properties. The Reference Guides section of the docs also includes the [Release Notes](/docs/reference/release-notes/) for each version of Gatsby.

Reference Guides work well for describing the nuts and bolts of how to use a Gatsby feature. You can think of a Reference Guide as an encyclopedia article about a specific plant. It lists details like the plant's defining characteristics, where it can be found, how it can be used. It might also include warnings about potential side effects.

A Reference Guide isn't meant to be read from start to finish. Rather, it's meant to be used by developers who are actively working on a project and need to look up some details about how a particular Gatsby feature works. It might include code examples to show how to use a feature in context, but it doesn't provide a full step-by-step process like what you'd expect from a [How-To Guide](/contributing/docs-contributions/how-to-write-a-how-to-guide) or [Tutorial](/contributing/docs-contributions/how-to-write-a-tutorial)

> For more information on Reference Guides, check out the [Divio documentation system](https://documentation.divio.com/reference-guides/), which the Gatsby docs are based on.

## A near-perfect example of a Reference Guide

Want to see what a good Reference Guide looks like? Check out the [Reference Guide: Gatsby Image plugin](/docs/reference/built-in-components/gatsby-plugin-image/).

## Reference Guide template

The structure of each Reference Guide will be slightly different, but they should have at least the following sections:

- **Introduction:** The first section. Provide some quick background information to help readers understand 1) what this feature is (at a high level) and 2) why it's useful.
- **Additional Resources:** The last section. Links to other docs or content that might be useful next steps for readers. Also, any resources that helped you write the Reference Guide.

The sections in between the Introduction and Additional Resources should be broken down in a way that best fits the feature you're describing.

You can copy and paste the markdown text below and fill it in with your own information. See the docs contributions guide for information about [structuring accessible headings](/contributing/docs-contributions#headings).

```markdown
---
title: Feature Name
---

## Introduction

In 2-3 sentences, give a high-level description of what this feature does,
why it's important, and when it might be helpful for users.

## Feature Name

Break up this section into multiple headings, as needed.

Here are some general tips for helpful things to include:

- Diagrams or other visuals, to show key processes or architectures.
  - Make sure to include alt text for accessibility! For
    help writing great alt text, refer to the W3C alt decision
    tree: https://www.w3.org/WAI/tutorials/images/decision-tree/
- Code examples, to show how to use the feature in practice.
  - Be sure to include all the necessary imports!
  - Introduce the code snippet with a sentence describing what the code does
    and which parts the reader should pay particular attention to.
  - Code snippets should be as close to real-world examples as possible.
    Avoid using "foobar" examples.
- Lists of parameters, including:
  - A description of what it does
  - The expected data type
  - The default value
- Tips for troubleshooting.
  - Are there any edge cases that readers should be aware of?
  - What common error messages might readers encounter? How can they
    resolve the problem?

## Additional Resources

Include other resources you think readers would benefit from or next steps
they might want to take after reading your Reference Guide. You can also
mention any resources that helped you write the article (blog posts, outside
tutorials, etc.).

- Link to a blog post
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```
