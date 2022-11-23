---
title: Customizing Markdown Components
---

Using MDX, you can replace every HTML element that Markdown renders with a
custom implementation. This allows you to use a set of design system components
when rendering.

```jsx:title=src/components/layout.jsx
import { MDXProvider } from "@mdx-js/react"
import * as DesignSystem from "your-design-system"

export default function Layout({ children }) {
  return (
    <MDXProvider
      components={{
        // Map HTML element tag to React component
        h1: DesignSystem.H1,
        h2: DesignSystem.H2,
        h3: DesignSystem.H3,
        // Or define component inline
        p: props => <p {...props} style={{ color: "rebeccapurple" }} />,
      }}
    >
      {children}
    </MDXProvider>
  )
}
```

**Note**: You can also provide your own custom components to the `MDXProvider` that make them globally available while writing MDX. You can find more details about this pattern in the [Importing and Using Components in MDX guide](/docs/how-to/routing/mdx#make-components-available-globally-as-shortcodes).

The following components can be customized with the MDXProvider:

<!-- remark lint doesn't realize the pipes in code blocks aren't table markers -->
<!-- prettier-ignore-start -->
<!-- lint ignore table-pipe-alignment -->

| Tag             | Name                                                                 | Syntax                                            |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| `p`             | [Paragraph](https://github.com/syntax-tree/mdast#paragraph)          |                                                   |
| `h1`            | [Heading 1](https://github.com/syntax-tree/mdast#heading)            | `#`                                               |
| `h2`            | [Heading 2](https://github.com/syntax-tree/mdast#heading)            | `##`                                              |
| `h3`            | [Heading 3](https://github.com/syntax-tree/mdast#heading)            | `###`                                             |
| `h4`            | [Heading 4](https://github.com/syntax-tree/mdast#heading)            | `####`                                            |
| `h5`            | [Heading 5](https://github.com/syntax-tree/mdast#heading)            | `#####`                                           |
| `h6`            | [Heading 6](https://github.com/syntax-tree/mdast#heading)            | `######`                                          |
| `thematicBreak` | [Thematic break](https://github.com/syntax-tree/mdast#thematicbreak) | `***`                                             |
| `blockquote`    | [Blockquote](https://github.com/syntax-tree/mdast#blockquote)        | `>`                                               |
| `ul`            | [List](https://github.com/syntax-tree/mdast#list)                    | `-`                                               |
| `ol`            | [Ordered list](https://github.com/syntax-tree/mdast#list)            | `1.`                                              |
| `li`            | [List item](https://github.com/syntax-tree/mdast#listitem)           |                                                   |
| `table`         | [Table](https://github.com/syntax-tree/mdast#table)                  | `--- | --- | --- | ---`                           |
| `tr`            | [Table row](https://github.com/syntax-tree/mdast#tablerow)           | `This | is | a | table row`                       |
| `td`/`th`       | [Table cell](https://github.com/syntax-tree/mdast#tablecell)         |                                                   |
| `pre`           | [Pre](https://github.com/syntax-tree/mdast#code)                     | ` ```js console.log()``` `                        |
| `code`          | [Code](https://github.com/syntax-tree/mdast#code)                    | `` `console.log()` ``                             |
| `em`            | [Emphasis](https://github.com/syntax-tree/mdast#emphasis)            | `_emphasis_`                                      |
| `strong`        | [Strong](https://github.com/syntax-tree/mdast#strong)                | `**strong**`                                      |
| `delete`        | [Delete](https://github.com/syntax-tree/mdast#delete)                | `~~strikethrough~~`                               |
| `code`          | [InlineCode](https://github.com/syntax-tree/mdast#inlinecode)        | `` `console.log()` ``                             |
| `hr`            | [Break](https://github.com/syntax-tree/mdast#break)                  | `---`                                             |
| `a`             | [Link](https://github.com/syntax-tree/mdast#link)                    | `https://mdxjs.com` or `[MDX](https://mdxjs.com)` |
| `img`           | [Image](https://github.com/syntax-tree/mdast#image)                  | `![alt](https://mdx-logo.now.sh)`                 |

<!-- lint enable table-pipe-alignment -->
<!-- prettier-ignore-end -->

## How does this work?

Components passed to the MDXProvider are used to render the HTML elements that Markdown creates. It uses [React's Context API](https://reactjs.org/docs/context.html).

## Related

- [MDX components](https://mdxjs.com/getting-started/)
- [Adding Components to Markdown with MDX](/docs/how-to/routing/mdx/)
- [gatsby-plugin-mdx README](/plugins/gatsby-plugin-mdx)
