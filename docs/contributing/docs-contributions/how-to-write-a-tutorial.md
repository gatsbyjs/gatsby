---
title: How to Write a Tutorial
---

The Gatsby Tutorial is a self-contained introduction that guides readers step-by-step through creating their first Gatsby site. The Tutorial is most useful when readers are first getting started with Gatsby.

The Tutorial is optimized for users who are not experts in React and/or JavaScript, and therefore has a different purpose, tone, and style than the rest of the docs. The other types of documentation (How-To Guides, Reference Guides, and Conceptual Guides) are optimized for those with intermediate to expert mastery with React and JavaScript.

## Tutorial purpose

By following the steps in a Gatsby tutorial, a user should:

- Experience the value of Gatsby as quickly as possible. With Gatsby, a user typically values that it takes fewer steps (and is therefore easier) to:
  - start coding immediately without being an expert
  - start a new project
  - make edits and see them through hot reloading
  - publish a site
  - do basic tasks like create pages, link between pages, create routing, change styles
- Know how to and actually start and deploy a site as quickly as possible.
- Be able to share their site.
- Know how to and actually find more advanced tutorials and docs.
- Use enough React to do basic tasks like creating pages, links, styles.
- Have fun!

## Tutorial audience

Through research, it's clear that developers of all skill levels read the main Gatsby tutorial and go back to reference it later.

Additional tutorials provide supplemental learning content for more Gatsby workflows as well as opportunities for members of the Gatsby community to contribute to the docs.

Gatsby tutorials should prioritize helping users with the following attributes and goals.

Attributes:

- new to React and interested in it
- new to Gatsby and interested in it
- new to JavaScript ecosystem and interested in it
- proficient with browsers and operating system basics

Looking for:

- a way to learn and/or improve React skills
- a way to start a site and/or app project that uses React

## Tutorial tone and style

The tone and style of a Gatsby tutorial should effectively help the audience reach their goals.

### Use personal "you" and be warm

The main tutorial ought to use the same personal “you” like the rest of the docs; in addition, the tutorial ought to use a warm, validating tone by congratulating users, complimenting them, and generally saying things like “yay!” more often.

### Don't make users think more than is necessary

Because the audience of the tutorial is people who do not consider themselves experts in React, it's important to reduce the amount of new information to bare minimum. The goal: give people only the information necessary to complete a task and to know how to repeat the task again, outside of the context of the tutorial.

In practice, you can reach this goal by two rules of thumb:

- Reduce the number of hyperlinks, tabs, and environments to the least number required to complete the tasks in the tutorial.
- When there are multiple ways to complete a task, give people only one way. This way ought to be the best practice possible within the constraints of the lowest supported versions of software. If the best practice isn't possible with the lowest supported versions of software, mention that as a side note.

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

See this [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code) on how to format code examples

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
