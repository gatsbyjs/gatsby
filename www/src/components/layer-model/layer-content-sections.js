import React from "react"
import { Link } from "gatsby"
import MdLoop from "react-icons/lib/md/loop"

import {
  fontSizes,
  space,
  colors,
  radii,
  shadows,
  transition,
  mediaQueries,
} from "../../utils/presets"

// Components for building sections used in the model
const LayerContentWrapper = ({ index, children }) => (
  <div
    id={`tabpanel${index}`}
    aria-labelledby={`tab${index}`}
    role="tabpanel"
    css={{
      padding: `${space[4]} 0`,
      display: `grid`,
      gridTemplateRows: `repeat(2, 1fr)`,
      gridTemplateAreas: `"example" "content"`,
      gridGap: 0,
      [mediaQueries.lg]: {
        gridTemplateRows: `1fr`,
        gridTemplateAreas: `"example content"`,
        gridTemplateColumns: `repeat(2, 1fr)`,
        gridGap: space[6],
      },
    }}
  >
    {children}
  </div>
)

const ExampleWrapper = ({ children }) => (
  <div
    css={{
      borderRadius: radii[3],
      overflow: `auto`,
    }}
  >
    {children}
  </div>
)

// prettier-ignore
const transitionProperty = `${transition.speed.default} ${transition.curve.default}`

const CodeWrapper = ({
  title,
  language,
  rotateButton = false,
  sourceIndex,
  setSourceIndex,
  children,
}) => (
  <React.Fragment>
    {title && (
      <div
        css={{
          position: `relative`,
          display: `flex`,
          alignItems: `center`,
          justifyContent: `space-between`,
          borderTopRightRadius: radii[3],
          borderTopLeftRadius: radii[3],
        }}
        className="gatsby-code-title"
      >
        <div css={{ fontSize: fontSizes[0] }}>{title}</div>
        {rotateButton && (
          <button
            css={{
              position: `absolute`,
              right: space[3],
              backgroundColor: `transparent`,
              border: `none`,
              color: colors.grey[60],
              cursor: `pointer`,
              padding: `${space[2]} ${space[2]}`,
              transition: transitionProperty,
              borderRadius: radii[2],
              whiteSpace: `nowrap`,
              ":focus, :hover, :active": {
                boxShadow: shadows.floating,
                color: colors.white,
              },
              ":hover": {
                backgroundColor: colors.purple[40],
              },
              ":focus": {
                backgroundColor: colors.purple[50],
              },
              ":active": {
                backgroundColor: colors.purple[60],
              },
              ":focus::before": {
                content: `"cycle source "`,
              },
              ":hover::before": {
                content: `"cycle source "`,
              },
            }}
            onClick={() => setSourceIndex((sourceIndex + 1) % sources.length)}
            aria-label="Update code source"
          >
            <MdLoop size={16} />
          </button>
        )}
      </div>
    )}
    <div className="gatsby-highlight">
      <pre className={`language-${language}`}>
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  </React.Fragment>
)

// Content sections using the above components
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
    <div>
      <p>
        <b>Content</b> is often organized in systems like databases, content
        management systems, files, or external APIs.
      </p>
      <p>
        Any source of data can be connected to Gatsby through plugins or using
        Gatsby's APIs.
      </p>
    </div>
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
      <p>
        <b>Building</b> compiles your application with modern features like
        server-side rendering, route based code splitting (
        <Link to="/blog/2019-04-02-behind-the-scenes-what-makes-gatsby-great/">
          and more!
        </Link>
        ) for great performance out of the box.
      </p>
      <p>
        During the build (when you run <code>gatsby build</code> or
        <code>gatsby develop</code>), data is fetched and combined into a
        GraphQL schema with a static snapshot of all data your site needs.
      </p>
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
      <p>
        <b>Data</b> returned by GraphQL comes back in the exact same shape that
        you asked for it, without having to travel across the network because it
        was already gathered at{` `}
        <Link to="/docs/glossary#build">build time</Link>.
      </p>
      <p>
        Since all data is combined in the data layer, it's even possible to
        query multiple sources at the same time.
      </p>
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
      <p>
        React powers components in Gatsby sites that are{` `}
        <Link to="/docs/glossary#rehydrate"> rehydrated</Link>, whatever you can
        do in React you can do with Gatsby.
      </p>
      <p>
        Your components can pull in whatever data they need from any source in
        the data layer.
      </p>
    </div>
  </LayerContentWrapper>
)

const AppLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <div
        css={{
          display: `flex`,
          flexDirection: `column`,
          height: `100%`,
        }}
      >
        <div
          css={{
            padding: space[2],
            backgroundColor: colors.grey[10],
            borderTopRightRadius: radii[2],
            borderTopLeftRadius: radii[2],
            border: `1px solid ${colors.ui.border.subtle}`,
          }}
        >
          Home
        </div>
        <div
          css={{
            padding: space[2],
            borderBottomRightRadius: radii[2],
            borderBottomLeftRadius: radii[2],
            backgroundColor: colors.white,
            border: `1px solid ${colors.ui.border.subtle}`,
            height: `100%`,
          }}
        >
          Gatsby tips
        </div>
      </div>
    </ExampleWrapper>
    <div>
      <p>
        The optimized <b>app</b> runs in the browser with all the speed of
        Gatsby as well as the convenience and great developer experience of
        working with tools like React and GraphQL.
      </p>
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
