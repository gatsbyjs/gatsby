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

- Blogposts (on gatsbyjs.org and other sites)
- Docs (on gatsbyjs.org and other sites)
- Video tutorials
- Discord, Spectrum, or Twitter conversations
- Google search results
- Presentations you or others have given
- Textbooks
- Dreams
- Anything else you can think of

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
the cultural meaning of an emoji, emoticon, or slang may be different around the world.
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

- Creating and modifying pages
- Adding a 404 page
- Querying data with GraphQL

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

- [Formatting inline code and code blocks](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code)
- [Adding images to articles](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#images).
  If the images aren’t already hosted somewhere else on the web, you’ll need to put them online yourself. A good way to do this is to commit them to a GitHub repository of your own, then push them to GitHub. Then you can right click the image and copy its image source.
- [Header formatting](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#headers). Avoid using H1 header; that is reserved for the title of each document.

#### Code titles

It's also possible to add code titles to your code blocks. As switching between multiple files in the course of the document can confuse some readers it's best to explicitly tell them where the code example should go. You can use syntax highlighting as usual, you need to add `:title=your-path-name` to it. Use it like so:

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

### Capitalize proper nouns

Proper nouns should use correct capitalization when possible. Below is a list of words as they should appear in Guide articles.

- JavaScript (capital letters in "J" and "S" and no abbreviations)
- Node.js

Front-end development (adjective form with a dash) is when you’re working on the
front end (noun form with no dash). The same goes with the back end, full stack,
and many other compound terms.

### Use active voice

Use active voice instead of passive voice. Generally, it's a more concise and
straightforward way to communicate a subject. For example:

- (Passive) The for loop in JavaScript is used by programmers to...
- (Active) Programmers use the for loop in JavaScript to...

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
