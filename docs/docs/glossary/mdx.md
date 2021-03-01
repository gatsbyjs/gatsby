---
title: MDX
disableTableOfContents: true
---

Learn what MDX is, and how you can use it when creating content for your Gatsby site.

## What is MDX?

[MDX](/docs/glossary/#mdx) is an extension to [Markdown](/docs/glossary/markdown/) that lets you include [JSX](/docs/glossary/#jsx) in Markdown documents. MDX makes it possible to include React components in your Gatsby blog posts and pages.

Markdown defines a plain text syntax for HTML elements such as `h1`, `strong`, and `a`, but still supports inline HTML. An example Markdown document follows.

```markdown
# Hello world!

You can use Markdown to create documents for [Gatsby](https://www.gatsbyjs.com/).

<figure class="chart">
  <object data="chart.svg" type="image/svg+xml"></object>
  <figcaption>MDX adoption has increased 120% since last year.</figcaption>
</figure>
```

MDX takes this one step further, and makes it possible to use JSX in your Markdown documents. Try making the `figure` element into a `Figure` component.

```jsx
export const Figure = props => {
  return (
    <figure class="chart">
      <object data={props.data} type="image/svg+xml"></object>
      <figcaption>{props.caption}</figcaption>
    </figure>
  )
}
```

Now you can import this component into your Markdown document.

```markdown
import { Figure } from './components/Figure';

# Hello world!

You can use Markdown to create documents for [Gatsby](https://www.gatsbyjs.com/).

<Figure data="chart.svg" caption="MDX adoption has increased 120% since last year." />
```

If you're creating a Gatsby site from scratch, the [gatsby-starter-mdx-basic](https://github.com/gatsbyjs/gatsby-starter-mdx-basic) is the fastest way to add MDX support. Use the Gatsby [CLI](/docs/glossary/#cli) to create a new project with this starter as a base.

```shell
gatsby new my-mdx-starter https://github.com/gatsbyjs/gatsby-starter-mdx-basic
```

To use MDX with an existing Gatsby site, add the [`gatsby-plugin-mdx`](/plugins/gatsby-plugin-mdx/?=gatsby-plugin-mdx) plugin. As with Gatsby itself, you can install it using [npm](/docs/glossary/#npm). You'll also need to install MDX itself, and the React implementation of MDX.

```shell
npm install gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react
```

Then add `gatsby-plugin-mdx` to your plugins list in `gatsby-config.js`, and set the [configuration options](/plugins/gatsby-plugin-mdx/?=gatsby-plugin-mdx#configuration) you prefer.

MDX enhances Markdown's capabilities so that you can use React components anywhere in your Gatsby-powered site.

### Learn more about MDX

- [MDX](https://mdxjs.com/) official site
- [What is MDX](https://www.youtube.com/watch?v=d2sQiI5NFAM) (video)
- [Adding Components to Markdown with MDX](/docs/how-to/routing/mdx/) from the Gatsby docs
- [Introducing JSX](https://reactjs.org/docs/introducing-jsx.html) from the React documentation
