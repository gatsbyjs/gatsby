---
title: Markdown
disableTableOfContents: true
---

Learn what Markdown is, why you might use it, and how it fits into the Gatsby ecosystem.

## What is Markdown?

Markdown is a plain text syntax for writing text documents that can be transformed to HTML. Markdown uses punctuation characters to indicate HTML elements. That punctuation then gets converted to HTML tags during a transformation or export process.

Markdown dates back to 2004, when John Gruber published the original [Markdown syntax guide](https://daringfireball.net/projects/markdown/syntax). Gruber, along with Aaron Swartz, created Markdown with two goals:

- to make Markdown <q>as easy-to-read and easy-to-write as is feasible.</q>; and
- to support inline HTML within Markdown-formatted text.

Text-to-HTML filters such as [Textile](https://textile-lang.com/) define a syntax that replaces a wide range of HTML elements. Other filters, such as [reStructuredText](https://docutils.readthedocs.io/en/sphinx-docs/user/rst/quickstart.html), do not support inline HTML tags.

Markdown, by contrast, only defines a syntax for a small subset HTML elements. For other elements, you use the corresponding HTML tag. In other words, Markdown makes it easy to write documents without knowing HTML, but HTML is available if you need it. A simple Markdown document might look like the following example.

You can use Markdown files as a content source for your Gatsby site. To do so, you'll need to install two plugins: [`gatsby-source-filesystem`](/packages/gatsby-source-filesystem/#gatsby-source-filesystem) and [`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/). As with Gatsby itself, you can install both using [npm](/docs/glossary/#npm).

```bash
npm install --save gatsby-source-filesystem gatsby-transformer-remark
```

The `gatsby-source-filesystem` plugin reads files from your computer. The `gatsby-transformer-remark` plugin makes the contents of your Markdown files available to GraphQL.

You can also try a [Gatsby starter](https://www.gatsbyjs.org/starters/?c=Markdown) package that has Markdown support already included.

## Learn more about Markdown

- [Markdown: Syntax](https://daringfireball.net/projects/markdown/syntax) from Daring Fireball
- [CommonMark](https://commonmark.org/)
- [Sourcing from the Filesystem](https://www.gatsbyjs.org/docs/sourcing-from-the-filesystem/) from the Gatsby docs
- [Adding Markdown Pages](https://www.gatsbyjs.org/docs/adding-markdown-pages/) from the Gatsby docs
