/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"

import InstallLayer from './text-content/InstallLayer'
import ConfigLayer from './text-content/ConfigLayer'
import QueryLayer from './text-content/QueryLayer'
import DisplayLayer from './text-content/DisplayLayer'



import {
  LayerContentWrapper,
  ExampleWrapper,
  CodeWrapper,
} from "../model-wrapper"

const InstallLayerContent = ({ index, displayCodeFullWidth }) => (
  <LayerContentWrapper
    key={`content-wrapper${index}`}
    index={index}
    displayCodeFullWidth={displayCodeFullWidth}
  >
    <ExampleWrapper>
      <CodeWrapper title="shell" language="shell">
        {`npm install gatsby-transformer-sharp gatsby-plugin-sharp gatsby-image`}
      </CodeWrapper>
    </ExampleWrapper>
    <div>
      <InstallLayer/>
    </div>
  </LayerContentWrapper>
)

const ConfigLayerContent = ({ index, displayCodeFullWidth }) => (
  <LayerContentWrapper
    key={`content-wrapper${index}`}
    index={index}
    displayCodeFullWidth={displayCodeFullWidth}
  >
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
      <ConfigLayer/>
    </div>
  </LayerContentWrapper>
)

const QueryLayerContent = ({ index, displayCodeFullWidth }) => (
  <LayerContentWrapper
    key={`content-wrapper${index}`}
    index={index}
    displayCodeFullWidth={displayCodeFullWidth}
  >
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
      <QueryLayer/>
    </div>
  </LayerContentWrapper>
)

const DisplayLayerContent = ({ index, displayCodeFullWidth }) => (
  <LayerContentWrapper
    key={`content-wrapper${index}`}
    index={index}
    displayCodeFullWidth={displayCodeFullWidth}
  >
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
      <DisplayLayer/>
    </div>
  </LayerContentWrapper>
)

export {
  InstallLayerContent,
  ConfigLayerContent,
  QueryLayerContent,
  DisplayLayerContent,
}