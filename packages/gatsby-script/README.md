# gatsby-script

An enhanced script component for Gatsby sites with support for various loading strategies.

Current usage looks like this (may change while in development):

```tsx
import * as React from "react"
import { Script, ScriptStrategy } from "gatsby-script" // or 'gatsby', or 'gatsby/script', TBD

// Example script sources for illustration
const scripts = {
  dayjs: `https://unpkg.com/browse/dayjs@1.11.0/dayjs.min.js`,
  three: `https://unpkg.com/three@0.139.1/build/three.js`,
  marked: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`,
}

// Strategy prop is optional, defaults to post-hydrate
function IndexPage() {
  return (
    <main>
      <h1>Script component proof of concept</h1>
      <Script src={scripts.dayjs} strategy={ScriptStrategy.preHydrate} />
      <Script src={scripts.three} strategy={ScriptStrategy.postHydrate} />
      <Script src={scripts.marked} strategy={ScriptStrategy.idle} />
      <Script dangerouslySetInnerHTML={{ __html: `alert('Hello world')` }} />
      <Script>{`alert('Hello world')`}</Script>
    </main>
  )
}

export default IndexPage
```
