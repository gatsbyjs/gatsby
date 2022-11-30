---
title: Markdown Syntax
---

Markdown is a very common way to write content in Gatsby posts and pages. This guide contains tips for Markdown syntax and formatting that might come in handy!

## Headings

```markdown
# heading 1

## heading 2

### heading 3

#### heading 4

##### heading 5

###### heading 6
```

Here's how those tags render in HTML:

# heading 1

## heading 2

### heading 3

#### heading 4

##### heading 5

###### heading 6

- each heading gets converted to their HTML equivalent
  - i.e. `# heading 1` is `<h1>heading 1</h1>`
- Correct usage of each heading should follow the
  [accessibility guidelines](https://www.w3.org/WAI/tutorials/page-structure/headings/) set by the World Wide Web Consortium (W3C)
  _Note: in the [Gatsby docs](/contributing/docs-contributions#headings), h1s are already included from `title` entries in frontmatter metadata, and contributions in Markdown should begin with h2._

## Emphasized text

- Italic
  - one asterisk or one underscore
    - `*italic*` or `_italic_`
    - _italic!_
- Bold
  - two asterisks or two underscores
    - `**bold**` or `__bold__`
    - **bold!**
- Italic and Bold

  - three asterisks or three underscore
    - `***italic and bold***` or `___italic and bold___`
    - **_italic and bold!!_**

## Lists

### Unordered

- can use `*`, `-`, or `+` for each list item

<!-- prettier-ignore-start -->

```markdown
* Gatsby
  * docs
- Gatsby
  - docs
+ Gatsby
  + docs
```

<!-- prettier-ignore-end -->

How unordered lists are rendered in HTML:

- Gatsby
  - docs
- Gatsby
  - docs
- Gatsby
  - docs

### Ordered

- number and period for each list item
- using `1.` for each item can automatically increment depending on the content

```markdown
1. One
1. Two
1. Three
```

1. One
2. Two
3. Three

## Links and images

### Link

Links in Markdown use this format. URLs can be relative or remote:

```markdown
[Text](url)
```

Example of a link rendering in HTML:

[Gatsby site](https://www.gatsbyjs.com/)

### Image with alt text

```markdown
![alt text](path-to-image)
```

### Image without alt text

This pattern is appropriate for [decorative or repetitive images](https://www.w3.org/WAI/tutorials/images/decision-tree/):

```markdown
![](path-to-image)
```

## Blockquote

- Use `>` to declare a blockquote
- Adding multiple `>` will create nested blockquotes
- It is recommended to place `>` before each line
- You can use other Markdown syntax inside blockquotes

```markdown
> blockquote
>
> > nested blockquote
>
> > **I'm bold!**
>
> more quotes
```

> Blockquote
>
> > nested blockquote
>
> > **I'm bold!**
>
> more quotes

## Code comments

### Inline

- Enclose the text in backticks \`code\`
- Inline `code` looks like this sentence

### Code blocks

- Indent a block by four spaces

## MD vs MDX

- MDX is a superset of Markdown. It allows you to write JSX inside markdown. This includes importing and rendering React components!

## Processing Markdown and MDX in Gatsby:

- In order to process and use Markdown or MDX in Gatsby, you can use the [gatsby-source-filesystem](/docs/sourcing-from-the-filesystem) plugin
- You can check out the package [README](/plugins/gatsby-source-filesystem) for more information on how it works!

## Frontmatter

- Metadata for your Markdown
- Variables that can later be injected into your components
- Must be:
  - At the top of the file
  - Valid YAML
  - Between triple dashed lines
  ```markdown
  ---
  title: My Frontmatter Title
  example_boolean: true
  ---
  ```

## Frontmatter + MDX example

```mdx
---
description: A simple example of a description in frontmatter
---

import { Chart } from "../components/chart"

# Here’s a chart

The chart is rendered inside our MDX document.

<Chart description={description} />
```

## Helpful resources

- [Markdown Syntax](https://daringfireball.net/projects/markdown/syntax)
- [Basic Syntax](https://www.markdownguide.org/basic-syntax)
