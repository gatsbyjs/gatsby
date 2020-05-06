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

const layers = [
  {
    title: `Content`,
    icon: `AbstractSymbol`,
    baseColor: `orange`,
    component: ContentLayerContent,
  },
  {
    title: `Build`,
    icon: `AtomicSymbol`,
    baseColor: `green`,
    component: BuildLayerContent,
  },
  {
    title: `Data`,
    icon: `GraphqlLogo`,
    baseColor: `magenta`,
    component: DataLayerContent,
  },
  {
    title: `View`,
    icon: `ReactLogo`,
    baseColor: `blue`,
    component: ViewLayerContent,
  },
  {
    title: `App`,
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