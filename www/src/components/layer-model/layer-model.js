import React, { useState, useEffect, useRef } from "react"
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

const Layer = ({ buttonRef, layer, onClick, selected, index }) => {
  const { baseColor, title } = layer

  return (
    <button
      key={`button${index}`}
      id={`tab${index}`}
      ref={buttonRef}
      tabIndex={selected ? 0 : -1}
      role="tab"
      aria-controls={`tabpanel${index}`}
      aria-selected={selected}
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
      <span
        css={{
          padding: space[2],
          display: `flex`,
          flexDirection: `column`,
        }}
      >
        <span css={{ height: 40 }}>
          <LayerIcon
            name={title}
            fillColor={selected ? colors[baseColor][70] : colors.grey[50]}
          />
        </span>
        <span>{title}</span>
      </span>
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

const LayerModel = ({ initialLayer = `Content` }) => {
  const [selected, setSelected] = useState(initialLayer)
  const [sourceIndex, setSourceIndex] = useState(0)
  const refs = useRef(layers.map(() => React.createRef()))
  function downHandler({ key }) {
    const currentIndex = layers.findIndex(layer => layer.title === selected)
    if (key === `ArrowLeft` && currentIndex !== 0) {
      const targetIndex = currentIndex - 1
      setSelected(layers[targetIndex].title)
      refs.current[targetIndex].current.focus()
    }
    if (key === `ArrowRight` && currentIndex !== layers.length - 1) {
      const targetIndex = currentIndex + 1
      setSelected(layers[targetIndex].title)
      refs.current[targetIndex].current.focus()
    }
  }
  useEffect(() => {
    window.addEventListener(`keydown`, downHandler)
    return () => {
      window.removeEventListener(`keydown`, downHandler)
    }
  }, [selected])
  return (
    <>
      <div
        css={{
          borderRadius: radii[3],
          backgroundColor: colors.grey[5],
        }}
      >
        <div
          role="tablist"
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
              buttonRef={refs.current[index]}
              index={index}
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
        (layer, index) =>
          selected === layer.title &&
          layer.component({ sourceIndex, setSourceIndex, index })
      )}
    </>
  )
}

export default LayerModel
