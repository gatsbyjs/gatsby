/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import {
  LayerContentWrapper,
  ExampleWrapper,
  CodeWrapper
} from "../model-wrapper"

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
