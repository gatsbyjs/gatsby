import React from "react"

import LayerModel from "../layer-model"
import {
  InstallLayerContent,
  ConfigLayerContent,
  QueryLayerContent,
  DisplayLayerContent,
} from "./image-content-sections"

const layers = [
  {
    title: `Install`,
    icon: `AbstractSymbol`,
    baseColor: `orange`,
    component: InstallLayerContent,
  },
  {
    title: `Config`,
    icon: `AtomicSymbol`,
    baseColor: `green`,
    component: ConfigLayerContent,
  },
  {
    title: `Query`,
    icon: `GraphqlLogo`,
    baseColor: `magenta`,
    component: QueryLayerContent,
  },
  {
    title: `Display`,
    icon: `ReactLogo`,
    baseColor: `blue`,
    component: DisplayLayerContent,
  },
]

const ImageModel = ({ initialLayer, ...props }) => {
  return (
    <LayerModel
      layers={layers}
      initialLayer={initialLayer}
      displayCodeFullWidth={true}
      {...props}
    />
  )
}

export default ImageModel