/** @jsx jsx */
import { jsx } from "theme-ui"

import ContentLayer from "./text-content/ContentLayer.md"
import BuildLayer from "./text-content/BuildLayer.md"
import DataLayer from "./text-content/DataLayer.md"
import ViewLayer from "./text-content/ViewLayer.md"
import AppLayer from "./text-content/AppLayer.md"

import {
  LayerContentWrapper,
  ExampleWrapper,
  CodeWrapper,
} from "../model-wrapper"

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
const ContentSource = ({ sourceIndex, setSourceIndex }) => (
  <CodeWrapper
    title={sources[sourceIndex].title}
    language={sources[sourceIndex].language}
    sourcesLength={sources.length}
    sourceIndex={sourceIndex}
    setSourceIndex={setSourceIndex}
    rotateButton={true}
  >
    {sources[sourceIndex].content}
  </CodeWrapper>
)
const ContentLayerContent = ({ sourceIndex, setSourceIndex, index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <ContentSource
        sourceIndex={sourceIndex}
        setSourceIndex={setSourceIndex}
      />
    </ExampleWrapper>
    <div><ContentLayer /></div>
  </LayerContentWrapper>
)

const BuildLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <CodeWrapper title="src/pages/homepage.js" language="javascript">
        {`const query = graphql\`
  query HomePageQuery {
    site {
      title
      description
    }
  }
\`
`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <BuildLayer />
    </div>
  </LayerContentWrapper>
)

const DataLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <CodeWrapper title="GraphQL Response" language="json">
        {`data: {
  site: {
    title: "Home"
    description: "Gatsby tips"
  }
}
`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <DataLayer />
    </div>
  </LayerContentWrapper>
)

const ViewLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <CodeWrapper title="src/pages/homepage.js" language="jsx">
        {`export ({ data }) => (
  <div>
    <h1>{data.site.title}</h1>
    {data.site.description}
  </div>
)
`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <ViewLayer />
    </div>
  </LayerContentWrapper>
)

const AppLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <div
        sx={{
          border: t => `1px solid ${t.colors.ui.border}`,
          borderRadius: 2,
          display: `flex`,
          flexDirection: `column`,
          height: `100%`,
          background: `ui.background`,
        }}
      >
        <div
          sx={{
            p: 3,
            borderBottom: t => `1px solid ${t.colors.ui.border}`,
          }}
        >
          Home
        </div>
        <div
          sx={{
            p: 3,
            height: `100%`,
            background: `ui.background`,
          }}
        >
          Gatsby tips
        </div>
      </div>
    </ExampleWrapper>
    <div>
      <AppLayer />
    </div>
  </LayerContentWrapper>
)

export {
  ContentLayerContent,
  BuildLayerContent,
  DataLayerContent,
  ViewLayerContent,
  AppLayerContent,
}