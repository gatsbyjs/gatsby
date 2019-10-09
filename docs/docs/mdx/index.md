---
title: Adding Components to Markdown with MDX
---

When writing long-form content in Markdown you might want to embed [components](/docs/glossary/#component).
This is often achieved by either writing content in JSX or using plugins that
use custom syntax. The first approach isn't optimal because JSX isn't the best
format for content and can make it less approachable to members of a team. Custom
syntax and plugins are often too inflexible and don't promote composition. If
you're finding yourself wanting to add components to your content you can use
`gatsby-plugin-mdx` which is a Gatsby plugin to integrate MDX into your project.

## What's MDX?

[MDX][mdx] is Markdown for the component era.
It lets you write JSX embedded inside Markdown.
It’s a great combination because it allows you to use Markdown’s terse
syntax (such as `# Heading`) for your content and JSX for more advanced,
or reusable components.

This is useful in content-driven sites where you want the ability
to introduce components like charts or alerts without having to
configure a plugin. It emphasizes composition over configuration
and really shines with interactive blog posts, documenting design
systems, or long form articles with immersive or dynamic
interactions.

When using MDX you can also import other MDX documents and render
them as components. This lets you write something like an FAQ
page in one place and reuse it throughout your website.

## What does it look like in practice?

Importing and JSX syntax works just like it does in your components. This
results in a seamless experience for developers and content authors alike.
Markdown and JSX are included alongside each other like this:

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

<GuideList slug={props.slug} />

[mdx]: https://mdxjs.com
