import * as React from 'react'
import { MDXProvider } from '@mdx-js/react'

const noop = () => <pre>TODO</pre>

const components = {
  IFrame: noop,
  EggheadEmbed: noop,
  GuideList: noop,
  ComponentModel: noop,
  Pullquote: noop,
  CloudCallout: noop,
  // a: CustomLink,
  // pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
}

export default function Provider (props) {
  return (
    <MDXProvider
      {...props}
      components={components}
    />
  )
}
