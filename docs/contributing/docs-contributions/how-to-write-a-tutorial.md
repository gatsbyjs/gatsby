---
title: How to Write a Tutorial
---

In contrast to recipes and reference guides, tutorials are step-by-step instructions for a series of related Gatsby tasks. Tutorials are grouped into Gatsby Fundamentals and Intermediate Tutorials ("The Gatsby Tutorial"), as well as Advanced Tutorials which can be explored individually as needed.

## Near perfect example of a tutorial

[Main Gatsby tutorial](https://www.gatsbyjs.com/tutorial/)

## What should a tutorial be about?

We need tutorials to guide users of all skill levels through performing a series of related tasks with Gatsby.

## How to choose a tutorial topic?

Topics should be chosen based on these priorities:

1. Tutorials related to improving [key learning workflows](https://github.com/gatsbyjs/gatsby/issues/13708)
2. Tutorials with the [help wanted and type:documentation](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22+label%3A%22type%3A+documentation%22) labels on GitHub
3. Tutorials that you or other community members would like to see

## Length of a tutorial

If a tutorial is longer than 3 8.5x11” pages or has more than about 5 headers and you’re finding yourself creating a Table of Contents at the top, it will probably be easier to read and easier for readers to complete if you turn it into a multi-page tutorial, like the [main Gatsby tutorial](https://www.gatsbyjs.com/tutorial/).

If you have a tutorial that falls into this category, it is likely a big enough project that you’ll benefit from the feedback process provided by creating an [RFC (Request for Comments) document](https://github.com/gatsbyjs/rfcs).

## Tutorial template

You can copy and paste the markdown text below and fill it in with your own information.

```markdown
---
title: How to Create a Decoupled Drupal Site with Gatsby
---

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
them at the bottom in an "Other Resources" section. You can also mention here any resources that helped you write the article (blog posts, outside tutorials, etc.).

- Link to a blog post
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
```
