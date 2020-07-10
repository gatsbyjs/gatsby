import React from "react"

import LayerModel from "../layer-model"

import InstallLayer from "./text-content/InstallLayer"
import ConfigLayer from "./text-content/ConfigLayer"
import QueryLayer from "./text-content/QueryLayer"
import DisplayLayer from "./text-content/DisplayLayer"

import {
  AbstractSymbol,
  AtomicSymbol,
  GraphqlLogo,
  ReactLogo,
} from "../../../assets/icons/layer-icons"

import CodeWrapper from "../code-wrapper"

const layers = [
  {
    title: `Install`,
    baseColor: `orange`,
    icon: <AbstractSymbol />,
    text: <InstallLayer />,
    example: (
      <CodeWrapper title="shell" language="shell">
        {`npm install gatsby-transformer-sharp gatsby-plugin-sharp gatsby-image`}
      </CodeWrapper>
    ),
  },
  {
    title: `Config`,
    baseColor: `green`,
    icon: <AtomicSymbol />,
    text: <ConfigLayer />,
    example: (
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
    ),
  },
  {
    title: `Query`,
    baseColor: `magenta`,
    icon: <GraphqlLogo />,
    text: <QueryLayer />,
    example: (
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
    ),
  },
  {
    title: `Display`,
    baseColor: `blue`,
    icon: <ReactLogo />,
    text: <DisplayLayer />,
    example: (
      <CodeWrapper title="src/pages/index.js" language="jsx">
        {`import Img from "gatsby-image"
export ({ data }) => (
  <div>
    <Img fluid={data.file.childImageSharp.fluid} alt="Gatsby logo" />
  </div>
)
`}
      </CodeWrapper>
    ),
  },
]

export default function ImageModel({ initialLayer }) {
  return (
    <LayerModel
      layers={layers}
      initialLayer={initialLayer}
      displayCodeFullWidth
    />
  )
}
