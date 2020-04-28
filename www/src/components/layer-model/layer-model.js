/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState, useEffect, useRef } from "react"
import hex2rgba from "hex2rgba"

import { colors } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import LayerIcon from "../../assets/icons/layer-icon"

const Layer = ({ buttonRef, layer, onClick, selected, index }) => {
  const { baseColor, title, icon } = layer

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
      sx={{
        bg: `ui.background`,
        border: selected
          ? t => `2px ${t.colors[baseColor][60]} solid`
          : `2px transparent solid`,
        borderRadius: 3,
        color: `textMuted`,
        cursor: `pointer`,
        fontWeight: selected ? `bold` : `body`,
        p: 2,
        ":focus": {
          boxShadow: t => `0 0 0 3px ${hex2rgba(colors[baseColor][30], 0.5)}`,
          outline: 0,
        },
        ":hover": {
          borderColor: t => t.colors[baseColor][60],
        },
      }}
    >
      <span
        sx={{
          display: `flex`,
          flexDirection: `column`,
          p: 2,
        }}
      >
        <span css={{ height: 40 }}>
          <LayerIcon
            name={icon}
            fillColor={selected ? colors[baseColor][70] : colors.grey[50]}
          />
        </span>
        <span>{title}</span>
      </span>
    </button>
  )
}

const LayerModel = ({
  layers,
  displayCodeFullWidth = false,
  initialLayer = `Content`,
}) => {
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
        <div
      sx={{
        borderRadius: 3,
        border: t => `1px solid ${t.colors.ui.border}`,
        padding: 2,
        marginBottom: 6,
      }}
    >
      <div
        sx={{
          borderRadius: 3,
          backgroundColor: `ui.background`,
        }}
      >
        <div
          role="tablist"
          sx={{
            display: `grid`,
            gridTemplateColumns: `repeat(${layers.length}, 1fr)`,
            gridGap: 1,
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
          layer.component({
            sourceIndex,
            setSourceIndex,
            index,
            displayCodeFullWidth,
          })
      )}
    </div>
  )
}

export default LayerModel
