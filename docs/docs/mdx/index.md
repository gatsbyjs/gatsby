---
title: MDX
---

[MDX][mdx] is Markdown for the component era.
It lets you write JSX embedded inside Markdown.
It’s a great combination because it allows you to use Markdown’s often terse
syntax (such as `# heading`) for your content and JSX for more advanced
components.

This is useful in content-driven sites where you want the ability
to introduce components like charts or alerts without having to
configure a plugin. It emphasizes composition over configuration
and really shines with interactive blog posts, documenting design
systems, or long form articles with ambitious layouts.

When using MDX you can also import other MDX documents and render
them as components. This lets you write something like an FAQ
page in one place and render it throughout your website.

## What does it look like in practice?

MDX might seem weird at first, but it quickly feels natural
after working with it for a few minutes. Importing and JSX
syntax works just like in your components. This results in a
seamless experience for developers and content authors alike.

```md
import { Chart } from '../components/chart'

# Here’s a chart

The chart is rendered inside our MDX document.

<Chart />
```

## Features

❤️ **Powerful**: MDX blends Markdown and JSX syntax to fit perfectly in
React/JSX-based projects.

💻 **Everything is a component**: Use existing components inside your
MDX and import other MDX files as plain components.

🔧 **Customizable**: Decide which component is rendered for each Markdown
element (`{ h1: MyHeading }`).

📚 **Markdown-based**: The simplicity and elegance of markdown remains;
you interleave JSX only when you want to.

🔥 **Blazingly blazing fast**: MDX has no runtime, all compilation occurs
during the build stage.

## Guides in this section

- [Getting started](/docs/mdx/getting-started)
- [Writing pages in MDX](/docs/mdx/writing-pages)
- [Customizing components](/docs/mdx/customizing-components)
- [Programmatically creating pages](/docs/mdx/programmatically-creating-pages)
- [Using plugins](/docs/mdx/plugins)

[mdx]: https://mdxjs.com
