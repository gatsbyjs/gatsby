---
title: Gatsby Style Guide
---

The Gatsby community is building out a more comprehensive Guides section. It
will be full of relevant articles written to be easily understood by the awesome people who love building with Gatsby!

We plan, write, and maintain these Guide articles on GitHub.

## Table of Contents

- [What are Guide articles?](#what-are-guide-articles)
- [What can I write an article about?](#what-can-i-write-an-article-about)
- [How to contribute](#how-to-submit-a-pr)
- [Running the Guide locally on your own computer](#running-the-guide-locally-on-your-own-computer)
- [Article style guide](#article-style-guide)

# What are Guide articles?

Guide articles can cover a broad range of topics. Please see the following
examples: [tutorials](/tutorial/part-one/),
[code documentation](/docs/browser-apis/),
[explanatory articles](/docs/prpl-pattern/), and
[focused guides](/docs/add-404-page/).

# What can I write an article about?

We welcome your help writing these articles! You don't have to be an expert in a
topic to write about it--this entire Guide is open source, so even if you make a
mistake, another contributor will eventually correct it.

If you’d like to help by writing an article, find a stub article in the Gatsby
Guides (with an italicized title like this _Title_), write the article, then
open a pull request (PR) in the Gatsby GitHub repo to replace the stub with your
article.

If you can't find a stub about the topic you'd like to write about, you can open
a PR in GitHub that creates the stub and includes your draft article. Feel free
to ask us questions if you're not sure where to put a new article in the
directory structure.

Before you begin writing, make sure to read the rest of this style guide.

# How to submit a PR

You can create a PR with your draft article (or edits on an existing article) in
two ways:

1.  The easiest method is to use the GitHub interface. Read
    [these instructions](https://help.github.com/articles/editing-files-in-another-user-s-repository/)
    on how to create a draft article or propose edits in the GitHub interface.
2.  Go into the
    ["docs" folder](https://github.com/gatsbyjs/gatsby/tree/master/docs/docs) and
    find the article stub you'd like to write or edit. All stubs will end with the .md file ending since they are written in Markdown.
3.  Click the "Edit this file" pencil icon and make your changes to the file in
    GitHub-flavored Markdown.
4.  Scroll to the bottom of the screen and add a commit message explaining your
    changes. Then select the radio button option for "Create a new branch for
    this commit and start a pull request" and click "Propose file changes"
5.  On the next screen, you can add any other details about your PR, then click
    "Create pull request".

If you prefer to write locally before submitting a PR, then follow these steps:

1.  Fork this repository
2.  Copy your fork to your local machine.
3.  Add a remote upstream so git knows where the official Gatsby
    repository is located by running the command `git remote add upstream`
    _incomplete code here_
4.  Create a new branch for your work with the command `git checkout -b NEW-BRANCH-NAME`. Try to name your branch in a way that describes your
    article topic, like `fix/ArticleHTMLElements`
5.  Write your article, commit your changes locally, and push your new branch to
    GitHub with the command `git push origin NEW-BRANCH-NAME`
6.  Go to your repository on GitHub and open a PR

Make sure to maintain your local fork going forward so it stays up-to-date with
the Gatsby guides repository. The next time you want to contribute, checkout
your local `master` branch and run the command `git pull --rebase upstream master` before creating a new branch. This will grab all the changes on the
official master branch without making an additional commit in your local
repository.

# Running www.gatsbyjs.org locally on your own computer

Finally, if you want to run a version of the www.gatsbyjs.org repository locally, follow
these steps:

1.  Ensure you have the yarn package manager installed `npm install -g yarn`
2.  Install the Gatsby cli `yarn add --global gatsby-cli`
3.  Follow the steps above to fork and clone the Gatsby repo.
4.  Enter the `www` directory where gatsbyjs.org is and install its dependencies `yarn install` then run `gatsby develop`.

# Article style guide

We've written the following article style guide to help you get started with
contributing.

### Table of Contents

- [Modularity](#modularity)
- [Format](#format)
- [How to write clearly](#how-to-write-clearly)

## Modularity

Each article should explain exactly one concept, and that concept should be
apparent from the article's title.

We can reference other articles by linking to them inline or in an "Other
Resources" section at the end of the article. Our goal is to have many articles that cover a broad range of technical topics rather than smashing too many topics into one article.

## Format

### Article title

Article titles should be as short and clear as possible. We want readers to
quickly find the information they're looking for and the title should reflect
the main theme of the article.

Here are some title examples:

- Creating and Modifying Pages
- 404 Pages
- What is GraphQL?

The folder name is used in the URL, so only use dashes -, numbers 0-9, and
lowercase letters a-z for it.

Here are some folder name examples:

- creating-and-modifying-pages
- 404-pages
- what-is-graphql

Note: Just to clarify, you can include special characters in the article title
but _not_ in the folder name (e.g. Title: What is GraphQL? and Folder Name:
what-is-graphql).

### Introductory paragraph

The introduction paragraph should be a 1-2 sentence explanation of the main
topic and answer the following questions:

- What is the topic of this document?
- What is the purpose of the document?
- What does the document contain?

### Prerequisites (if any)

If applicable, list any prerequisites to reading and understanding your article. Does the reader need to read another document first, install a particular plugin, or already know a certain skill? List those things here.

### Body of text

Keep paragraphs short (around 1-4 sentences). People are more likely to read
several short paragraphs instead of a huge block of text.

Readers will likely use doc articles as a quick reference to look up syntax.
Articles should have a basic, real-world example that shows common use cases of its syntax.

### Other resources

If there are other resources you think readers would benefit from or next steps they might want to take after reading your article, add
them at the bottom in an "Other Resources" section. You can also mention here any resources that helped you write the article (blogposts, outside tutorials, etc.).

## How to Write Clearly

### Create an outline

Before you begin writing, decide what goal the reader will accomplish by reading your article. What should they know or be able to do afer they have read it? Then, create an outline of the topic and think about any
coding examples you'll use (if applicable). This helps to organize your thoughts and make the writing process easier.

### Search for content

Many times, the content that needs to go in your article already exists somewhere in the world. Look through these resources and feel free to use the content to create your own article (just remember to reference where you got the information from if you didn't write it and it was not already official Gatsby content:

- Blogposts (on gatsbyjs.org and other sites)
- Docs (on gatsbyjs.org and other sites)
- Video tutorials
- Presentations you or others have given
- Textbooks
- Dreams
- Anything else you can think of

### Formatting example code

Here are specific formatting guidelines for any code:

- JavaScript statements end with a semicolon
- Use double quotes where applicable
- Show generally-accepted best practices, particularly for accessibility
- Comments made should have a space between the comment characters and the
  comment themselves
- GitHub-flavored markdown supports syntax highlighting in code blocks for many
  programming languages. To use it, indicate the language after the opening three back ticks \`\`\`

  ```html
   <div class="awesome" id="more-awesome">
     <p>This is text in html</p>
   </div>
  ```

  ```javascript
  function logTheThings(stuff) {
    console.log(stuff)
  }
  ```

  ```css
  .awesome {
    background-color: #fccfcc;
  }
  ```

### Format language keywords as code

Format language keywords as code - this is done with the backtick key (located
to the left of the "1" key on a US keyboard) in GitHub-flavored markdown. For
example, put backticks around HTML tag names or CSS property names.

### Use clear hyperlinks

Hyperlinks should contain the clearest words to indicate where the link will lead you. So instead of linking to the word [here](https://www.gatsbyjs.org/) link to [Gatsby's docs](https://www.gatsbyjs.org/).

In tutorials that are meant for beginners, use as few hyperlinks as possible to minimize distractions. In docs, it's ok to include as many hyperlinks as necessary to provide relevant and interesting information and resources.

### Indicate when a sentence or section is optional

When a paragraph or sentence offers an optional path, the beginning of the first sentence should indicate that it's optional. For example, "if you'd like to learn more about xyz, see our reference guide" is clearer than "Go to the reference guide if you'd like to learn more about xyz."

This method allows people who would _not_ like to learn more about xyz to stop reading the sentence as early as possible. This method also allows people who _would_ like to learn more about xyz to recognize the opportunity to learn quicker instead of accidentally skipping over the paragraph.

### Define jargon

Articles should be written with short, clear sentences, and use as little jargon
as necessary. All jargon should be defined immediately in plain English. In
other words, pretend like your readers have very little coding experience; you
need to define words that beginners might have a hard time understanding.

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

### Abbreviate terms

If you want to abbreviate a term in your article, write it out fully first, then
put the abbreviation in parentheses. After that, you may use the abbreviation going for the rest of the article. For example, "In computer science, an
abstract syntax tree (AST) is ..."

### Use "you" as the pronoun

Your articles should use the second person ("you") to help to give it a conversational
tone. This way, the text and instructions seem to speak directly to the person
reading it. Try to avoid using the first person ("I", "we", "let's", and "us".

Using "you" is also more accurate than saying "we," because typically only one person is reading the tutorial or guide at a time and the person who wrote the tutorial is not actually going through it with them, so "we" would be inaccurate. Finally, some technical documentation uses third person pronouns and nouns like "they" and "the user," which add more distance and feel colder than the conversational and warm "you" and "your."

### Avoid emojis and slang

Don't use emojis or emoticons in the Guide and idiomatic expressions / slang. Gatsby has a global community, and
the cultural meaning of an emoji, emoticon, or slang may be different around the world.
Also, emojis can render differently on different systems.

### Make lists clear with the Oxford Comma

Use the Oxford Comma when possible (it is a comma used after the penultimate
item in a list of three or more items, before ‘and’ or ‘or’ e.g. an Italian
painter, sculptor, and architect). It makes things easier, clearer, and prettier
to read.

### Avoid "easy" and "simple"

Avoid using words like "easy", "simple," and "basic" because if users have a hard time completing the task that is supposedly "easy," they will question their abilities. Consider using more specific descriptors; for example, when you say the phrase "deployment is easy," what do you really mean? Is it easy because it takes fewer steps than another option? If so, just use the most specific descriptor possible, which in that case would be "this deployment method involves fewer steps than other options."

### Adding images to articles

You can add diagrams, graphics, or visualizations as necessary. You can also
embed relevant YouTube videos and interactive [REPL.it](https://repl.it/) code
editors.

For including images, if the images aren't already hosted somewhere else on the
web, you'll need to put them online yourself. A good way to do this is to commit
them to a GitHub repository of your own, then push them to GitHub. Then you can
right click the image and copy its image source.

Then you'd just need to reference them in your markdown file with this syntax:
`[your alt text](your url)`

Then the images should show up when you click the "preview table" tab.

### Apps that help you edit

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

### Ask for/accept help & offer help to others

Technical writing, or the literature of science and technology, is difficult
because it requires you to take a technical (usually abstract) topic and explain
it in a clear, accurate, and objective manner. You'll likely go through several
rounds of proofreading and editing before you're happy with your writing.

Also, there's a community of support from a whole team of contributors, whom you
can bounce ideas off of and ask for input on your writing. Stay active in the
contributors chat room and ask lots of questions.

With your help, we can create a comprehensive reference tool that will help
millions of people who are learning to code for years to come.
