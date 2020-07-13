---
title: Customizing Markdown Components
---

import MarkdownSyntaxTable from "@components/shared/markdown-syntax-table"

Using MDX, you can replace every HTML element that Markdown renders with a
custom implementation. This allows you to use a set of design system components
when rendering.

```jsx:title=src/components/layout.js
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

**Note**: you can also provide your own custom components to the `MDXProvider` that make them globally available while writing MDX. You can find more details about this pattern in the [Importing and Using Components in MDX guide](/docs/mdx/importing-and-using-components/#make-components-available-globally-as-shortcodes).

The following components can be customized with the MDXProvider:

<MarkdownSyntaxTable />

## How does this work?

Components passed to the MDXProvider are used to render the HTML elements
that Markdown creates. It uses
[React's Context API](https://reactjs.org/docs/context.html).

## Related

- [MDX components](https://mdxjs.com/getting-started/)
