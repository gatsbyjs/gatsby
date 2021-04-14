---
title: How to Write a How-To Guide
---

## What is a How-To Guide?

A How-To Guide is a practical step-by-step guide that helps readers achieve a specific goal. How-To Guides are most useful when readers want to get something done.

How-To Guides work well for outlining procedures that readers need to follow. You can think of a How-To Guide as a recipe used in cooking. It walks you through the steps to complete a task, from start to finish. It should only include as much context as is needed to help users achieve their goal.

A How-To Guide can include _some_ details to help users understand the steps they're following. For example, you should add a quick sentence before showing a code snippet, to explain what the code does (at a high level) and which pieces to pay special attention to. If you find yourself wanting to provide deeper explanations of how something works, consider creating a separate [Reference Guide](/contributing/docs-contributions/how-to-write-a-reference-guide) or [Conceptual Guide](/contributing/docs-contributions/how-to-write-a-conceptual-guide) and then linking to it in the How-To Guide.

> For more information on How-To Guides, check out the [Diátaxis documentation system](https://diataxis.fr/how-to-guides/), which the Gatsby docs are based on.

## How-To Guides audience

How-To Guides are for anyone looking to complete a common Gatsby task, however they may appeal to intermediate to advanced learners due to their brevity and focus on Gatsby-specific details without going through every setup step.

## How-To Guides tone and style

How-To Guides are shorter and more concise than the Tutorial but more hands-on than Reference Guides. They should be friendly but information-dense. This is accomplished by focusing on only what is relevant and actionable to the given task, anticipating any new or difficult concepts with links to additional materials to continue learning.

## A near-perfect example of a How-To Guide

Want to see what a good How-To Guide looks like? Check out the [How-To Guide: Add a Plugin to Your Site](/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site).

## How-To Guide template

The title of your How-To Guide should specify what it helps readers do. You should be able to add the words "how to" to the beginning and have it make sense. For example, if your guide is about "how to create a new layout component", the title would be "Create a New Layout Component."

A How-To Guide should include the following sections:

- **Introduction:** Provide some quick background information to help readers understand 1) what this How-To Guide will help them achieve and 2) why that's useful.
- **Prerequisites:** Any additional information or setup readers will have to do before they can make use of this How-To Guide.
- **Directions:** List out the steps that readers to follow to complete the task. Use code blocks to show exactly what readers should type in their own projects.
- **Additional Resources:** Links to other docs or content that might be useful next steps for readers. Also, any resources that helped you write the How-To Guide.

```markdown
---
title: Do Some Task
---

## Introduction

The introductory paragraph should be a 2-3 sentence explanation of the
main topic and answer the following questions:

What is the purpose of this guide? What will readers have achieved by
following the steps in this guide?

Why is this process worth doing? How will it help readers improve their
Gatsby site?

## Prerequisites

If applicable, list any prerequisites to reading and understanding your
article.

Does the reader need to read another document first, install a particular
plugin, or already know a certain skill? List those things here.

## Directions

This section should be a step-by-step list of instructions for how readers
can achieve the goal.

1. Do the first thing.
2. Do the next thing.

Use code blocks to show exactly what readers should type. The
Gatsby Style Guide includes tips for best practices when using code
blocks:
https://www.gatsbyjs.com/contributing/gatsby-style-guide/#format-code-blocks-inline-code-and-images

If it's a particularly long list of directions, you can split the steps into
sections. Use subheadings to label each chunk. For example:

### Step 1: Do the first thing.

1. The first step of the first thing.
1. The second step of the first thing.

### Step 2: Do some other thing.

1. The first step of some other thing.
1. The second step of some other thing.

## Additional Resources

Include other resources you think readers would benefit from or next steps
they might want to take after reading your How-To Guide. You can also
mention any resources that helped you write the article (blog posts, outside
tutorials, etc.).

Best-case scenario, these should be high-quality, evergreen
(not quickly outdated) resources.

- Link to a blog post
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```
