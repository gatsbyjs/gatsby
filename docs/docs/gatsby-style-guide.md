---
title: Gatsby Style Guide
---

The Gatsby community is building out a more comprehensive Docs section. It
will be full of relevant articles written to be easily understood by the many people who love building with Gatsby.

The community plans, writes, and maintains these Docs on GitHub.

## Table of Contents

- [Welcome!](#welcome)
- [What kinds of docs can I write?](#what-kinds-of-docs-can-i-write)
- [Writing process](#writing-process)
  - [Think of your audience](#think-of-your-audience)
  - [Research](#research)
  - [Write drafts and get feedback](#write-drafts-and-get-feedback)
- [Word choice](#word-choice)
  - [Use "you" as the pronoun](#use-you-as-the-pronoun)
  - [Avoid "easy" and "simple"](#avoid-easy-and-simple)
  - [Avoid emojis, slang, and metaphors](#avoid-emojis-slang-and-metaphors)
  - [Define jargon](#define-jargon)
- [Writing style](#writing-style)
  - [Write concisely](#write-concisely)
  - [Use clear hyperlinks](#use-clear-hyperlinks)
  - [Indicate when something is optional](#indicate-when-something-is-optional)
  - [Abbreviate terms](#abbreviate-terms)
  - [Use SEO optimized titles](#use-seo-optimized-titles)
- [Grammar & formatting](#grammar-and-formatting)
  - [Format titles and headers](#format-titles-and-headers)
  - [Format code blocks, inline code, and images](#format-code-blocks-inline-code-and-images)
  - [Capitalize proper nouns](#capitalize-proper-nouns)
  - [Use active voice](#use-active-voice)
  - [Make lists clear with the Oxford Comma](#make-lists-clear-with-the-oxford-comma)
  - [Use apps that help you edit](#use-apps-that-help-you-edit)
- [Best practices](#best-practices)
  - [Support software versions](#software-versions)
  - [Share best practices whenever possible](#share-best-practices-whenever-possible)
- [The difference between tutorials and docs](#the-difference-between-tutorials-and-docs)
  - [Tutorial](#tutorial)
    - [Tutorial Audience](#tutorial-audience)
    - [Tutorial Purpose](#tutorial-purpose)
    - [Tutorial Tone and style](#tutorial-tone-and-style)
  - [Docs](#docs)
    - [Docs Audience](#docs-audience)
    - [Docs Purpose](#docs-purpose)
    - [Docs Tone and style](#docs-tone-and-style)

## Welcome!

You don't have to be an expert in a
topic to write about it--this entire website is open source, so even if you make a mistake, another contributor will help you correct it before the PR gets merged.

If you’d like to help by writing an article, find a stub article in the Gatsby
Docs (with a grey instead of black title in the sidebar of the Docs), write the article, then
[open a pull request (PR)](/docs/how-to-contribute/#contributing-to-the-documentation) in the Gatsby GitHub repo to replace the stub with your article.

If you can't find a stub about the topic you'd like to write about, you can open a PR in GitHub that creates the stub and includes your draft article. Feel free to ask questions in the PR comments if you're not sure where to put a new article in the directory structure.

Before you begin writing, make sure to read the rest of this style guide.

## What kinds of docs can I write?

Docs can cover a broad range of topics. Please see the following
examples:

- [guides](/docs/add-404-page/)
- [guide overviews](/docs/styling/)
- [tutorials](/tutorial/part-one/)
- [plugin READme](/packages/gatsby-source-filesystem/)
- [starter READme](https://github.com/gatsbyjs/gatsby-starter-default)

Please see the [Docs templates](/docs/templates/) for guidelines on how to format the above kinds of documents.

## Writing process

### Think of your audience

Before you begin writing, answer these questions. Sample answers have been included:

Question: Who will read my writing?
_Answer: Developers with knowledge and experience coding in HTML, CSS, and JS but not necessarily React or GraphQL._

Question: What do I hope my readers will know and/or be able to do after reading it?
_Answer (example): I hope my readers will be able to successfully add search to their Gatsby site._

Once you answer those questions, create an outline of the topic and think about any coding examples you'll use (if applicable). This helps to organize your thoughts and make the writing process easier.

### Research

Many times, the information that needs to go in your document already exists somewhere.

Avoid copying and pasting huge chunks of other people's work. Instead, use their work to learn so you can write your own document. If you do quote someone's work verbatim, reference where you got the information.

If the content is already somewhere else on the .org site, feel free to copy and paste without quoting or referencing.

Possible sources of great research materials:

- blogposts (on gatsbyjs.org and other sites)
- docs (on gatsbyjs.org and other sites)
- video tutorials
- Discord, Spectrum, or Twitter conversations
- Google search results
- presentations you or others have given
- textbooks
- dreams
- anything else you can think of

### Write drafts and get feedback

Technical writing, or the literature of science and technology, is difficult
because it requires you to take a technical (usually abstract) topic and explain
it in a clear, accurate, and objective manner. You'll likely go through several
rounds of proofreading and editing before you're happy with your writing.

Also, there's a community of contributors to support you. Bounce ideas off of them and ask for input on your writing in the
[Discord chat room](https://discordapp.com/invite/0ZcbPKXt5bVoxkfV) and in the [GitHub repo](https://github.com/gatsbyjs/gatsby).

## Word choice

### Use "you" as the pronoun

Your articles should use the second person ("you") to help to give it a conversational tone. This way, the text and instructions seem to speak directly to the person reading it. Try to avoid using the first person ("I", "we", "let's", and "us").

Using "you" is also more accurate than saying "we," because typically only one person is reading the tutorial or guide at a time and the person who wrote the tutorial is not actually going through it with them, so "we" would be inaccurate. You might notice that some technical documentation uses third person pronouns and nouns like "they" and "the user," which add more distance and feel colder than the conversational and warm "you" and "your."

### Avoid "easy" and "simple"

Avoid using words like "easy", "simple," and "basic" because if users have a hard time completing the task that is supposedly "easy," they will question their abilities. Consider using more specific descriptors; for example, when you say the phrase "deployment is easy," what do you really mean? Is it easy because it takes fewer steps than another option? If so, just use the most specific descriptor possible, which in that case would be "this deployment method involves fewer steps than other options."

### Avoid emojis, slang, and metaphors

Avoid using emojis or emoticons in the Docs and idiomatic expressions / slang, or metaphors. Gatsby has a global community, and
the cultural meaning of an emoji, emoticon, or slang may be different around the world. Use your best judgment!
Also, emojis can render differently on different systems.

### Define jargon

Articles should be written with short, clear sentences, and use as little jargon
as necessary.

> Jargon: (n.) special words or expressions that are used by a particular profession or group and are difficult for others to understand: legal jargon.

All jargon should be defined immediately in plain English. In
other words, pretend like your readers have basic coding experience but not necessarily experience with PWAs and the JAMstack (see what happened there? I just used two jargon words that need to be defined); you
need to define words that newcomers might have a hard time understanding.

## Writing style

### Write concisely

Concise writing communicates the bare minimum without redundancy. Strive to make your writing as short as possible; this practice will often lead to more accurate and specific writing.

### Use clear hyperlinks

Hyperlinks should contain the clearest words to indicate where the link will lead you. So instead of linking to the word [here](https://www.gatsbyjs.org/) link to [Gatsby's docs](https://www.gatsbyjs.org/).

In tutorials that are meant for beginners, use as few hyperlinks as possible to minimize distractions. In docs, it's ok to include as many hyperlinks as necessary to provide relevant and interesting information and resources.

### Indicate when something is optional

When a paragraph or sentence offers an optional path, the beginning of the first sentence should indicate that it's optional. For example, "if you'd like to learn more about xyz, see our reference guide" is clearer than "Go to the reference guide if you'd like to learn more about xyz."

This method allows people who would _not_ like to learn more about xyz to stop reading the sentence as early as possible. This method also allows people who _would_ like to learn more about xyz to recognize the opportunity to learn quicker instead of accidentally skipping over the paragraph.

### Abbreviate terms

If you want to abbreviate a term in your article, write it out fully first, then
put the abbreviation in parentheses. After that, you may use the abbreviation going for the rest of the article. For example, "In computer science, an
abstract syntax tree (AST) is ..."

### Use SEO optimized titles

This explains how to create a doc that shows up in Google searches.

When you create the new guide or tutorial under /docs/, you’ll either create a file or a folder if there will be images pulled into the doc.

File:
`querying-data-with-graphql.md`

or

Folder:
`querying-data-with-graphl`
`querying-data-with-graphl/index.md`
`querying-data-with-graphl/graphql-image.png`

The `.md` title or the folder title gets turned into the URL route automatically.

Article titles should be short and reflect the main theme of the article to help readers quickly find relevant info. Many people use Google to search for things like "gatsby graphql", so the article title should ideally reflect what people might search for on Google.

Here are some title examples:

- Creating & Modifying Pages
- Adding a 404 Page
- Querying Data with GraphQL

The folder name is used in the URL, so only use dashes -, numbers 0-9, and
lowercase letters a-z for it.

Here are some folder name examples:

- creating-and-modifying-pages
- adding-a-404-page
- querying-data-with-graphql

Note: Just to clarify, you can include special characters in the article title
but _not_ in the `.md` file name or folder name (e.g. Title: What is GraphQL? and Folder Name:
what-is-graphql).

## Grammar and formatting

### Format titles and headers

Title case article titles (each major word is uppercase). Sentence case article headings (only the initial word is uppercase). Neither need punctuation at the end of the phrase unless a question mark is required. Article titles do not take the Oxford comma and use the ampersand in place of “and.” Article headings do take the Oxford comma and use the word “and.”

Titles are automatically formatted as h1. Mark up article headings as h2 and subheads as h3 or h4 as needed. Most article headings are conceptually and rhetorically at the same level as each other; avoid unnecessary complexity and mark them up as h2 unless they’re true subheads.

Article title or document title:

> Salty, Sweet & Spicy

Article header or subhead:

> Salty, sweet, and spicy

### Format code blocks, inline code, and images

Use the following as reference when creating and editing docs:

- [formatting inline code and code blocks](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code)
- [adding images to articles](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#images).
  If the images aren’t already hosted somewhere else on the web, you’ll need to put them online yourself. A good way to do this is to commit them to a GitHub repository of your own, then push them to GitHub. Then you can right click the image and copy its image source.
- [header formatting](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#headers). Avoid using H1 header; that is reserved for the title of each document.

#### Code formatting: Type tab

Each code snippet will include a tab showing the language type the snippet contains. For example, the following YAML snippet will show a "YAML" tab...

````
```yaml
- id: John Smith
  bio: Thinks documentation is the coolest.
  twitter: @j
```
````

...like so:

```yaml
- id: John Smith
  bio: Thinks documentation is the coolest.
  twitter: @j
```

Please use the following language keywords where appropriate:

- `javascript` or `js`
- `jsx`
- `graphql`
- `html`
- `css`
- `shell`
- `yaml`
- `markdown`
- `diff`
- `flow`

If a language keyword is omitted, the type will show as `TEXT` (as shown above).

#### Code formatting: Titles

Where appropriate, add code titles to your code blocks. Switching between multiple files in the course of the document can confuse some readers. It's best to explicitly tell them where the code example should go. You can use syntax highlighting as usual, then add `:title=your-path-name` to it. Use it like so:

````
```javascript:title=src/util/alert.js
const s = "I solemnly swear that I'm up to no good.";
alert(s);
```
````

Which will then look like:

```javascript:title=src/util/alert.js
const s = "I solemnly swear that I'm up to no good."
alert(s)
```

#### Code formatting: Line highlighting

You may also choose in include line highlighting in your code snippets, using the following keywords inline in the snippet:

##### `highlight-line`: highlights the current line

````
```javascript:title=gatsby-config.js
module.exports = {
	siteMetadata: {
		title: `GatsbyJS`, // highlight-line
		siteUrl: `https://www.gatsbyjs.org`,
	},
}
```
````

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `GatsbyJS`, // highlight-line
    siteUrl: `https://www.gatsbyjs.org`,
  },
}
```

##### `highlight-next-line`: highlights the next line

````
```javascript:title=gatsby-config.js
module.exports = {
	siteMetadata: {
		title: `GatsbyJS`,
		// highlight-next-line
		siteUrl: `https://www.gatsbyjs.org`,
	},
}
```
````

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `GatsbyJS`,
    // highlight-next-line
    siteUrl: `https://www.gatsbyjs.org`,
  },
}
```

##### `highlight-start` & `highlight-end`: highlights a range

````
```javascript:title=gatsby-config.js
module.exports = {
	// highlight-start
	siteMetadata: {
		title: `GatsbyJS`,
		siteUrl: `https://www.gatsbyjs.org`,
	},
	// highlight-end
}
```
````

```javascript:title=gatsby-config.js
module.exports = {
  // highlight-start
  siteMetadata: {
    title: `GatsbyJS`,
    siteUrl: `https://www.gatsbyjs.org`,
  },
  // highlight-end
}
```

### Capitalize proper nouns

Proper nouns should use correct capitalization when possible. Below is a list of words as they should appear in Guide articles.

- JavaScript (capital letters in "J" and "S" and no abbreviations)
- Node.js

A full-stack developer (adjective form with a dash) works on the full stack
(noun form with no dash). The same goes with many other compound terms.

Use frontend for both adjective and noun forms as it's [more common and easier to maintain](https://github.com/gatsbyjs/gatsby/pull/8873#issuecomment-444255465). For example,
a frontend developer works on the frontend. The same goes for backend.

### Use active voice

Use active voice instead of passive voice. Generally, it's a more concise and
straightforward way to communicate a subject. For example:

- (passive) The for loop in JavaScript is used by programmers to...
- (active) Programmers use the for loop in JavaScript to...

### Make lists clear with the Oxford Comma

Use the Oxford Comma except in titles. It is a comma used after the penultimate
item in a list of three or more items, before ‘and’ or ‘or’ e.g. an Italian
painter, sculptor, and architect. It makes things clearer.

[Confusion can happen when you don't use the Oxford comma](https://img.buzzfeed.com/buzzfeed-static/static/2015-02/22/18/enhanced/webdr11/enhanced-buzz-32156-1424646300-12.jpg?downsize=715:*&output-format=auto&output-quality=auto).

### Use apps that help you edit

Use the [Hemingway App](http://www.hemingwayapp.com/). There’s nothing magical
about this tool, but it will automatically detect widely agreed-upon
style issues:

- passive voice
- unnecessary adverbs
- words that have more common equivalents

The Hemingway App will assign a “grade level” for your writing. You should aim
for a grade level of 6. Another tool available is the De-Jargonizer, originally
designed for scientific communication but might help avoid overspecialized
wording.

## Best practices

### Support software versions

When Gatsby commits to support a specific version of software (e.g. Node 6 and up), this is reflected in documentation. Gatsby documentation should be usable by all people on supported software, which means we don't introduce any commands or practices that can't be used by people on versions we've committed to support. In rare circumstances, we'll consider mentioning a newly introduced command or practice as side notes.

For example, npm 5.2.0 (which comes with Node 8) introduced a command called `npx` that is not available for versions of Node below 8. Since Gatsby supports Node 6 and up, documentation should only introduce `npx` as an optional command in a note like so:

> npm 5.2.0--bundled with Node 8--introduced a command called `npx`. Gatsby supports Node 6 and up, so we introduce `npx` here as an optional command for users of npm 5.2.0 or greater.

### Share best practices whenever possible

When there are multiple ways to complete a task, the docs should explain the following:

1. The most fundamental way of completing the task
2. The most common way of completing a task
3. The best way to complete the task on the lowest supported versions of software
4. The best practice and why is it the best (if different than 3)
5. Any tips on how to pick an option

For example, `gatsby-image` is a component that includes Gatsby best practices for handling images, yet there are more fundamental and common ways of handling them. Documentation ought to make the best practice clear in addition to the most common and fundamental ways.

## The difference between tutorials and docs

The main tutorial at `/tutorial/` is optimized for users who are not experts in React and/or JavaScript, and therefore has a different purpose, tone, and style than the docs. The docs at `/docs/` are optimized for those with intermediate to expert mastery with React and JavaScript.

## Tutorial

### Tutorial audience

Through research, it's clear that developers of all skill levels read the tutorial and go back to reference it later.

The tutorial should prioritize helping users with the following attributes and goals.

Attributes:

- new to React and interested in it
- new to Gatsby and interested in it
- new to JavaScript ecosystem and interested in it
- proficient with browsers and operating systems

Looking for:

- a way to learn and/or improve React skills
- a way to start a site and/or app project that uses React

### Tutorial purpose

By following the steps in the tutorial, a user should:

- Experience the value of Gatsby as quickly as possible. With Gatsby, a user typically values that it takes fewer steps (and is therefore easier) to:
  - start coding immediately without being an expert
  - start a new project
  - make edits and see them thru hot reloading
  - publish a site
  - do basic tasks like create pages, link between pages, create routing, change styles
- Know how to and actually start and deploy a site as quickly as possible.
- Be able to share their site.
- Know how to and actually find more advanced tutorials and docs.
- Have fun!
- Use enough React to do basic tasks like creating pages, links, styles.

### Tutorial tone and style

The tone and style of the tutorial should effectively help the audience reach their goals.

### Use personal "you" and be warm

The main tutorial ought to use the same personal “you” like the rest of the docs; in addition, the tutorial ought to use a warm, validating tone by congratulating users, complimenting them, and generally saying things like “yay!” more often.

> Why not use "yay" in the docs as well? Since the tutorial's goal is to help users complete a series of steps, it is possible and helpful to congratulate them on successfully completing each step. Guides in the docs act as reference guides that users can browse at will rather than read from top to bottom. It doesn't make sense to congratulate someone on finishing a guide, since it's not a series of steps.

#### Don't make users think more than is necessary

Because the audience of the tutorial is people who do not consider themselves experts in React, it's important to reduce the amount of new information to bare minimum. The goal: give people only the information necessary to complete a task and to know how to repeat the task again, outside of the context of the tutorial.

In practice, you can reach this goal by two rules of thumb:

- Reduce the number of hyperlinks, tabs, and environments to the least number required to complete the tasks in the tutorial.
- When there are multiple ways to complete a task, give people only one way. This way ought to be the best practice possible within the constraints of the lowest supported versions of software. If the best practice isn't possible with the lowest supported versions of software, mention that as a side note.

## Docs

### Docs audience

Through research, it's clear that developers of all skill levels read the docs and find them useful.

The tutorial should focus on helping users with the following attributes and goals.

Attributes:

- intermediate to advanced at React
- front-end developer
- prefer using google search and/or `ctrl + f` to find things on the gatsbyjs.org site

Looking for:

- way to get a site up and running quickly
- a quick way to get the right words, types, defaults, descriptions, parameters, and returns for the API
- bits of source code to study and/or copy
- step-by-step tutorials for advanced tasks
- understanding how Gatsby works at a deep level, so deep that they could actually modify or customize their own projects, or contribute to Gatsby core
- how does Gatsby really work with Redux, React, and GraphQL?
- error messages that tell them if it’s a known bug/issue, lead them to docs, and/or suggest fixes
- guides for how things work in Gatsby
- they usually already have strong opinions or requirements about what they want to use as their CMS or data source and want to know best practices for their workflow
- signs that Gatsby is a reliable, long-term choice (signs that it is growing and improving and evidence it will be around for a long time)
- ways to check their project’s requirements against what Gatsby offers
- open source code from well-built example sites

### Docs purpose

By referencing the docs, a user should:

- get tasks done as quickly as possible
- evaluate options for getting tasks done as quickly as possible
- build sites and apps as quickly as possible, including the following kinds of sites:
  - marketing
  - blogs
  - portfolio
  - e-commerce
  - authentication

### Docs tone and style

The tone and style of the docs should effectively help the audience reach their goals.

### Use personal "you"

The docs use the personal “you” to address the user.

#### Give experts as much relevant info to get the task done as quickly as possible

Because the audience of the docs is people who have intermediate to expert level of mastery with React, it's important to provide the information needed to complete tasks in addition to all relevant and helpful context, references,and alternatives. The goal: give people the information necessary to get tasks done as quickly and effectively as possible.

In practice, you can reach this goal by two rules of thumb:

- Include an "additional information" section at the bottom of each guide with hyperlinks to relevant external blogposts, tutorials, and other Gatsby resources and docs.
- When there are multiple ways to complete a task, [follow these instructions](#share-best-practices-whenever-possible).

## KPIs

Here is how we measure the quality of the tutorial and docs. We will use ([cohort analysis](https://www.geckoboard.com/learn/kpi-examples/mobile-app-kpis/retention-rate/) to track improvements or regressions to the tutorial and docs.

### Tutorial

- time to value: how quickly, effectively, and painlessly can users experience the value of Gatsby?
- daily, weekly, monthly active users
- daily, weekly, monthly “finishers” of the tutorial (finisher = people who spend 5 mins minimum on each page of tutorial and go through whole thing)
- weekly retention rate

### Docs

- time to task: how quickly and effectively can users accomplish tasks?
- daily, weekly, monthly active users
- weekly retention rate

## Why we chose GitHub for writing and maintaining docs

The way the Gatsby community maintains docs and tutorials must meet the following requirements:

- ability to ship quickly
- ability to iterate quickly
- OSS contributor access
- code editing functionality
- version control
- a way to get feedback on each doc

GitHub meets this requirements.
