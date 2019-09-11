import React from "react"
import { Link } from "gatsby"

import { fontSizes, space, colors, radii } from "../../utils/presets"

// Components for building sections used in the model
const LayerContentWrapper = ({ children }) => (
  <div
    css={{
      padding: `${space[4]} 0`,
      display: `grid`,
      gridTemplateAreas: `example content`,
      gridTemplateColumns: `1fr 1fr`,
      gridGap: space[6],
    }}
  >
    {children}
  </div>
)

const ExampleWrapper = ({ children }) => (
  <div
    css={{
      borderRadius: radii[3],
    }}
  >
    {children}
  </div>
)

const CodeWrapper = ({ title, language, children }) => (
  <React.Fragment>
    {title && (
      <div
        css={{ borderTopRightRadius: radii[3], borderTopLeftRadius: radii[3] }}
        className="gatsby-code-title"
      >
        <div css={{ fontSize: fontSizes[0] }}>{title}</div>
      </div>
    )}
    <div className="gatsby-highlight">
      <pre css={{ marginBottom: 0 }} className={`language-${language}`}>
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  </React.Fragment>
)

// Content sections using the above components
const ContentLayerContent = () => (
  <LayerContentWrapper>
    <ExampleWrapper>
      <CodeWrapper title="site-data.yaml" language="yaml">
        {`site:
  title: Home
  description: Gatsby tips
`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <p>
        <b>Content</b> is often organized in systems like databases, content
        management systems, files, or external APIs.
      </p>
      <p>
        Any source of data can be connected Gatsby through plugins or using
        Gatsby's APIs.
      </p>
    </div>
  </LayerContentWrapper>
)

const BuildLayerContent = () => (
  <LayerContentWrapper>
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

const DataLayerContent = () => (
  <LayerContentWrapper>
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
        Since all data is combined in the data layer, it's possible to query
        multiple sources at the same time.
      </p>
    </div>
  </LayerContentWrapper>
)

const ViewLayerContent = () => (
  <LayerContentWrapper>
    <ExampleWrapper>
      <CodeWrapper title="src/pages/homepage.js" language="javascript">
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

const AppLayerContent = () => (
  <LayerContentWrapper>
    <ExampleWrapper>
      <div
        css={{
          display: `flex`,
          flexDirection: `column`,
          height: `100%`,
          padding: space[2],
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
