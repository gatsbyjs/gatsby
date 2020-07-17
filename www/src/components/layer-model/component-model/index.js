/** @jsx jsx */
import { jsx } from "theme-ui"

import LayerModel from "../layer-model"
import CodeWrapper from "../code-wrapper"

import ContentLayer from "./text-content/ContentLayer.md"
import BuildLayer from "./text-content/BuildLayer.md"
import DataLayer from "./text-content/DataLayer.md"
import ViewLayer from "./text-content/ViewLayer.md"
import AppLayer from "./text-content/AppLayer.md"

import {
  AbstractSymbol,
  AtomicSymbol,
  GraphqlLogo,
  ReactLogo,
  AppWindow,
} from "../../../assets/icons/layer-icons"

import ContentSource from "./content-source"
import AppLayerExample from "./app-layer-example"

const layers = [
  {
    title: `Content`,
    baseColor: `orange`,
    icon: <AbstractSymbol />,
    text: <ContentLayer />,
    example: <ContentSource />,
  },
  {
    title: `Build`,
    icon: <AtomicSymbol />,
    baseColor: `green`,
    text: <BuildLayer />,
    example: (
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
    ),
  },
  {
    title: `Data`,
    icon: <GraphqlLogo />,
    baseColor: `magenta`,
    text: <DataLayer />,
    example: (
      <CodeWrapper title="GraphQL Response" language="json">
        {`data: {
  site: {
    title: "Home"
    description: "Gatsby tips"
  }
}
`}
      </CodeWrapper>
    ),
  },
  {
    title: `View`,
    icon: <ReactLogo />,
    baseColor: `blue`,
    text: <ViewLayer />,
    example: (
      <CodeWrapper title="src/pages/homepage.js" language="jsx">
        {`export ({ data }) => (
  <div>
    <h1>{data.site.title}</h1>
    {data.site.description}
  </div>
)
`}
      </CodeWrapper>
    ),
  },
  {
    title: `App`,
    icon: <AppWindow />,
    baseColor: `yellow`,
    text: <AppLayer />,
    example: <AppLayerExample />,
  },
]

export default function ComponentModel({ initialLayer }) {
  return <LayerModel layers={layers} initialLayer={initialLayer} />
}
