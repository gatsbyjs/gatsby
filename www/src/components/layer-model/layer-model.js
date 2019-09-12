import React, { useState } from "react"
import hex2rgba from "hex2rgba"

import { space, colors, radii } from "../../utils/presets"
import LayerIcon from "../../assets/icons/layer-icon"
import {
  ContentLayerContent,
  BuildLayerContent,
  DataLayerContent,
  ViewLayerContent,
  AppLayerContent,
} from "./layer-content-sections"

const Layer = ({ layer, onClick, selected, children }) => {
  const { baseColor, title } = layer

  return (
    <button
      onClick={onClick}
      css={{
        cursor: `pointer`,
        borderRadius: radii[3],
        padding: space[2],
        color: colors.grey[60],
        fontWeight: selected ? `bold` : `normal`,
        backgroundColor: colors.grey[5],
        border: selected
          ? `2px ${colors[baseColor][60]} solid`
          : `2px transparent solid`,
        ":focus": {
          outline: 0,
          boxShadow: `0 0 0 3px ${hex2rgba(colors[baseColor][30], 0.5)}`,
        },
        ":hover": {
          backgroundColor: colors[baseColor][5],
        },
      }}
    >
      <div
        css={{
          padding: space[2],
        }}
      >
        <div css={{ height: 40 }}>
          <LayerIcon
            name={title}
            fillColor={selected ? colors[baseColor][70] : colors.grey[50]}
          />
        </div>
        <div>{title}</div>
      </div>
    </button>
  )
}

const layers = [
  {
    title: `Content`,
    baseColor: `orange`,
    component: ContentLayerContent,
  },
  {
    title: `Build`,
    baseColor: `purple`,
    component: BuildLayerContent,
  },
  {
    title: `Data`,
    baseColor: `magenta`,
    component: DataLayerContent,
  },
  {
    title: `View`,
    baseColor: `blue`,
    component: ViewLayerContent,
  },
  {
    title: `App`,
    baseColor: `yellow`,
    component: AppLayerContent,
  },
]
const ContentMeshModel = ({ initialLayer }) => {
  const [selected, setSelected] = useState(initialLayer)
  const [sourceIndex, setSourceIndex] = useState(0)
  return (
    <>
      <div
        css={{
          borderRadius: radii[3],
          backgroundColor: colors.grey[5],
        }}
      >
        <div
          css={{
            display: `grid`,
            gridTemplateColumns: `repeat(5, 1fr)`,
            gridGap: space[1],
            textAlign: `center`,
          }}
        >
          {layers.map((layer, index) => (
            <Layer
              key={index}
              layer={layer}
              onClick={() => {
                setSelected(layer.title)
              }}
              selected={selected === layer.title}
            />
          ))}
        </div>
      </div>
      {layers.map(
        layer =>
          selected === layer.title &&
          layer.component({ sourceIndex, setSourceIndex })
      )}
    </>
  )
}

export default ContentMeshModel
