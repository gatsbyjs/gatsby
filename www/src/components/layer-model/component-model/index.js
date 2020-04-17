/** @jsx jsx */
import { jsx } from "theme-ui"
import LayerModel from "../layer-model"
import {
  ContentLayerContent,
  BuildLayerContent,
  DataLayerContent,
  ViewLayerContent,
  AppLayerContent,
} from "./component-content-sections"

import { t } from "@lingui/macro"


const layers = [
  {
    title: t`Content`,
    icon: `AbstractSymbol`,
    baseColor: `orange`,
    component: ContentLayerContent,
  },
  {
    title: t`Build`,
    icon: `AtomicSymbol`,
    baseColor: `green`,
    component: BuildLayerContent,
  },
  {
    title: t`Data`,
    icon: `GraphqlLogo`,
    baseColor: `magenta`,
    component: DataLayerContent,
  },
  {
    title: t`View`,
    icon: `ReactLogo`,
    baseColor: `blue`,
    component: ViewLayerContent,
  },
  {
    title: t`App`,
    icon: `AppWindow`,
    baseColor: `yellow`,
    component: AppLayerContent,
  },
]

const ComponentModel = ({ initialLayer, ...props }) => {
  return (
    <LayerModel
      layers={layers}
      initialLayer={initialLayer}
      {...props}
    />
  )
}

export default ComponentModel