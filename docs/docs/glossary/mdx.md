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
import { Figure } from "./components/Figure"

# Hello world!

You can use Markdown to create documents for [Gatsby](https://www.gatsbyjs.com/).

<Figure data="chart.svg" caption="MDX adoption has increased 120% since last year." />
```

If you're creating a Gatsby site from scratch, you can use `npm init gatsby` to kick off a new site with MDX. At the question "Would you like to install additional features with other plugins?" choose the option "Add Markdown and MDX support".

### Learn more about MDX

- [MDX](https://mdxjs.com/) official site
- [Adding Components to Markdown with MDX](/docs/how-to/routing/mdx/) from the Gatsby docs
- [Introducing JSX](https://reactjs.org/docs/introducing-jsx.html) from the React documentation
