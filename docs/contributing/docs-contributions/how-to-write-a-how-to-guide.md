---
title: How to Write a How-To Guide
---

## What is a How-To Guide?

A How-To Guide is a practical step-by-step guide that helps readers achieve a specific goal. How-To Guides are most useful when readers want to get something done.

How-To Guides work well for explaining procedures that readers need to follow. You can think of a How-To Guide as a recipe used in cooking. It walks you through the steps to complete a task, from start to finish. It should only include as much context as is needed to help users achieve their goal.

A How-To Guide can include _some_ details to help users understand the steps they're following. For example, you should add a quick sentence before showing a code snippet, to explain what the code does (at a high level) and which pieces to pay special attention to. If you find yourself wanting to provide deeper explanations of how something works, consider creating a separate [Reference Guide](/contributing/docs-contributions/how-to-write-a-reference-guide) or [Conceptual Guide](/contributing/docs-contributions/how-to-write-a-conceptual-guide) and then linking to it in the How-To Guide.

> For more information on How-To guides, check out the [Divio documentation system](https://documentation.divio.com/how-to-guides/), which the Gatsby docs are based on.

## A Near-Perfect Example of a How-To Guide

Want to see what a good How-To Guide looks like? Check out the [How-To Guide: Add a Plugin to Your Site](/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site).

## Creating a How-To Guide

1. Find an issue.
1. In the `gatsby` repo, create a new Markdown file in the `/docs/docs/how-to` directory.
1. Use the How-To Guide Template below to write your guide.
1. Open a PR.

## How-To Guide Template

The title of your How-To Guide should specify what it helps readers do. You should be able to add the words "how to" to the beginning and have it make sense. For example, if your guide is about "how to create a new layout component", the title would be "Create a New Layout Component."

A How-To Guide should include the following sections:

- **Introduction:** Provide some quick background information to help readers understand 1) what this How-To Guide will help them achieve and 2) why that's useful.
- **Prerequisites:** Any additional information or setup readers will have to do before they can make use of this How-To Guide.
- **Directions:**
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

- Link to a blog post
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```
