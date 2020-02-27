/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"
import MdLoop from "react-icons/lib/md/loop"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

// Components for building sections used in the model
const LayerContentWrapper = ({ index, children }) => (
  <div
    id={`tabpanel${index}`}
    aria-labelledby={`tab${index}`}
    role="tabpanel"
    sx={{
      py: 4,
      px: 0,
      display: `grid`,
      gridTemplateRows: `repeat(2, 1fr)`,
      gridTemplateAreas: `"example" "content"`,
      gridGap: 0,
      [mediaQueries.lg]: {
        gridTemplateRows: `1fr`,
        gridTemplateAreas: `"example content"`,
        gridTemplateColumns: `repeat(2, 1fr)`,
        gridGap: 6,
      },
    }}
  >
    {children}
  </div>
)

const ExampleWrapper = ({ children }) => (
  <div
    sx={{
      borderRadius: 2,
      overflow: `auto`,
    }}
  >
    {children}
  </div>
)

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
        sx={{
          position: `relative`,
          display: `flex`,
          alignItems: `center`,
          justifyContent: `space-between`,
          borderTopRightRadius: 2,
          borderTopLeftRadius: 2,
        }}
        className="gatsby-code-title"
      >
        <div sx={{ fontSize: 0 }}>{title}</div>
        {rotateButton && (
          <button
            sx={{
              position: `absolute`,
              right: t => t.space[3],
              backgroundColor: `transparent`,
              border: `none`,
              color: `grey.60`,
              cursor: `pointer`,
              p: 2,
              transition: `default`,
              borderRadius: 2,
              whiteSpace: `nowrap`,
              ":focus, :hover, :active": {
                boxShadow: `floating`,
                color: `white`,
              },
              ":hover": {
                backgroundColor: `purple.40`,
              },
              ":focus": {
                backgroundColor: `purple.50`,
              },
              ":active": {
                backgroundColor: `purple.60`,
              },
              ":focus::before": {
                content: `"cycle source "`,
              },
              ":hover::before": {
                content: `"cycle source "`,
              },
            }}
            onClick={() => setSourceIndex((sourceIndex + 1) % 4)}
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

const InstallLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
    <CodeWrapper title="shell" language="shell">
        {`npm install gatsby-transformer-sharp gatsby-plugin-sharp gatsby-image`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <p>
        Using images in Gatsby requires a few different plugins.
      </p>
      <p>
      <b>Install</b> <code>gatsby-transformer-sharp</code> and <code>gatsby-plugin-sharp</code> to transform and process your images. <code>gatsby-image</code> is a package that includes a component you'll use later in "View".
      </p>
    </div>
  </LayerContentWrapper>
)

const ConfigLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <CodeWrapper title="gatsby-config.js" language="javascript">
        {`plugins: [
  \`gatsby-transformer-sharp\`,
  \`gatsby-plugin-sharp\`,
  {
    resolve: \`gatsby-source-filesystem\`,
    options: {
      path: \`\${__dirname}/src/images\`,
    },
  },
  ...
]`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <p>
        When you set up the <b>Config</b> for your site, you'll want to include <code>gatsby-transformer-sharp</code> and <code>gatsby-plugin-sharp</code>.
      </p>
      <p>
        You'll also need to configure <code>gatsby-source-filesystem</code> with the appropriate options. The <code>path</code> should be the path to the directory your image files live in. 
      </p>
    </div>
  </LayerContentWrapper>
)

const QueryLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <CodeWrapper title="src/pages/index.js" language="graphql">
        {`const query = graphql\`
  query {
    file(relativePath: { eq: "images/gatsby-logo.png" }) {
      childImageSharp {
        fluid {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
\`
`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <p>
        In order to take advantage of fast image processing in Gatsby, you need to <b>Query</b> your image using GraphQL. Under the hood, this query is processed using <code>gatsby-transformer-sharp</code>. 
        </p>
      <p>
        When querying for a specific image you use the <code>relativePath</code>. This path is relative to the path you configured for the <code>gatsby-source-filesystem</code> plugin and should ultimately point to your image file.
        </p>
      <p>
        Inside the query you'll notice <code>fluid</code> and <code>GatsbyImageSharpFluid</code> query terms. There are other{` `} <Link to="/packages/gatsby-image/#two-types-of-responsive-images">types of image processing</Link> you can prompt with your query which will alter both of those query terms.
      </p>
    </div>
  </LayerContentWrapper>
)

const DisplayLayerContent = ({ index }) => (
  <LayerContentWrapper key={`content-wrapper${index}`} index={index}>
    <ExampleWrapper>
      <CodeWrapper title="src/pages/index.js" language="jsx">
        {`import Img from "gatsby-image"
        export ({ data }) => (
  <div>
  <Img fluid={data.file.childImageSharp.fluid} alt="Gatsby logo" />
  </div>
)
`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <p>
        Now you can use JSX to add the processed image to your page. You need to import <code>Img</code> from <code>gatsby-image</code>, the package you installed at the beginning.
      </p>
      <p>
        Using the <code>Img</code> tag you'll pass in the object returned from your GraphQL query. The key <code>fluid</code> matches the way the image was processed. It needs to match. And always include an alt tag with a description of your image.
      </p>
    </div>
  </LayerContentWrapper>
)

export {
  InstallLayerContent,
  ConfigLayerContent,
  QueryLayerContent,
  DisplayLayerContent,
}
