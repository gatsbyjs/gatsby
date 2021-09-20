/** @jsx jsx */
import { jsx } from "theme-ui"
import { useState } from "react"

import CodeWrapper from "../code-wrapper"

// This content is only used when you click "cycle sources" in the Content pane
const sources = [
  {
    title: `site-data.yaml`,
    language: `yaml`,
    content: `site:
  title: Home
  description: Gatsby tips
`,
  },
  {
    title: `site-data.json`,
    language: `json`,
    content: `{
  "site": {
    "title": "Home",
    "description": "Gatsby tips"
  }
}
`,
  },
  {
    title: `gatsby-config.js (CMS)`,
    language: `cms`,
    content: `plugins: [
  \`gatsby-source-contentful\`,
  \`gatsby-source-wordpress\`,
  \`gatsby-source-drupal\`,
  ...
]`,
  },
  {
    title: `gatsby-config.js (SaaS)`,
    language: `cms`,
    content: `plugins: [
  \`gatsby-source-airtable\`,
  \`gatsby-source-shopify\`,
  \`gatsby-source-firebase\`,
  ...
]`,
  },
  {
    title: `SQL Database`,
    language: `db`,
    content: `+----+---------+-------------+
| ID |  Title  |    Desc     |
+----+---------+-------------+
|  1 | Home    | Gatsby tips |
+----+---------+-------------+`,
  },
]

export default function ContentSource() {
  const [sourceIndex, setSourceIndex] = useState(0)
  const { title, language, content } = sources[sourceIndex]

  function handleRotate() {
    setSourceIndex(i => (i + 1) % sources.length)
  }

  return (
    <CodeWrapper title={title} language={language} onRotate={handleRotate}>
      {content}
    </CodeWrapper>
  )
}
