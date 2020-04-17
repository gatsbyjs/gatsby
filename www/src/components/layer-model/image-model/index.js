import React from "react"

import LayerModel from "../layer-model"
import {
  InstallLayerContent,
  ConfigLayerContent,
  QueryLayerContent,
  DisplayLayerContent,
} from "./image-content-sections"

import { t } from "@lingui/macro"

const layers = [
  {
    title: t`Install`,
    icon: `AbstractSymbol`,
    baseColor: `orange`,
    component: InstallLayerContent,
  },
  {
    title: t`Config`,
    icon: `AtomicSymbol`,
    baseColor: `green`,
    component: ConfigLayerContent,
  },
  {
    title: t`Query`,
    icon: `GraphqlLogo`,
    baseColor: `magenta`,
    component: QueryLayerContent,
  },
  {
    title: t`Display`,
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