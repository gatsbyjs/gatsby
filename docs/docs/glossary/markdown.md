---
title: Markdown
disableTableOfContents: true
---

Learn what Markdown is, why you might use it, and how it fits into the Gatsby ecosystem.

## What is Markdown?

Markdown is a plain text syntax for writing text documents that can be transformed to HTML. Markdown uses punctuation characters to indicate HTML elements. That punctuation then gets converted to HTML tags during a transformation or export process.

Markdown dates back to 2004, when John Gruber published the original [Markdown syntax guide](https://daringfireball.net/projects/markdown/syntax). Gruber, along with Aaron Swartz, created Markdown with two goals:

1. to make Markdown <q>as easy-to-read and easy-to-write as is feasible.</q>; and
2. to support inline HTML within Markdown-formatted text.

Text-to-HTML filters such as [Textile](https://textile-lang.com/) define a syntax that replaces a wide range of HTML elements. Other filters, such as [reStructuredText](https://docutils.readthedocs.io/en/sphinx-docs/user/rst/quickstart.html), do not support inline HTML tags.

Markdown, by contrast, only defines a syntax for a small subset of HTML elements. For other elements, you use the corresponding HTML tag. In other words, Markdown makes it possible to write documents without knowing HTML, but HTML is available if you need it. A Markdown document might look like the example that follows.

```markdown
# Markdown!

You can use Markdown to create documents for [Gatsby](https://www.gatsbyjs.com/).

<figure class="chart">
  <object data="chart.svg" type="image/svg+xml"></object>
  <figcaption>
    Developers who love using Gatsby versus those who haven't tried it yet.
  </figcaption>
</figure>
```

When converted to HTML, the preceding Markdown will become the markup below.

```html
<h1>Markdown!</h1>
<p>
  You can use Markdown to create documents for
  <a href="https://www.gatsbyjs.com/">Gatsby</a>.
</p>
<figure class="chart">
  <object data="chart.svg" type="image/svg+xml"></object>
  <figcaption>
    Developers who love using Gatsby versus those who haven't tried it yet.
  </figcaption>
</figure>
```

You can use Markdown files as a content source for your Gatsby site. To do so, you'll need to install two plugins: [`gatsby-source-filesystem`](/plugins/gatsby-source-filesystem) and [`gatsby-transformer-remark`](/plugins/gatsby-transformer-remark/). As with Gatsby itself, you can install both using [npm](/docs/glossary/#npm).

```shell
npm install gatsby-source-filesystem gatsby-transformer-remark
```

The `gatsby-source-filesystem` plugin reads files from your computer. The `gatsby-transformer-remark` plugin makes the contents of your Markdown files available to GraphQL.

You can also try a [Gatsby starter](https://www.gatsbyjs.com/starters/?c=Markdown) package that has Markdown support already included.

## Learn more about Markdown

- [Markdown syntax](/docs/reference/markdown-syntax/) from the Gatsby docs
- [CommonMark](https://commonmark.org/), a proposed Markdown specification
- [Sourcing from the Filesystem](/docs/how-to/sourcing-data/sourcing-from-the-filesystem) from the Gatsby docs
- [Adding Markdown Pages](/docs/how-to/routing/adding-markdown-pages/) from the Gatsby docs
