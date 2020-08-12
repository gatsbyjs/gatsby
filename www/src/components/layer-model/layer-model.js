/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState, useEffect, useRef } from "react"

import LayerTab from "./layer-tab"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const LayerContentWrapper = ({
  index,
  displayCodeFullWidth = false,
  children,
}) => (
  <div
    id={`tabpanel${index}`}
    aria-labelledby={`tab${index}`}
    role="tabpanel"
    sx={{
      pt: 4,
      px: 0,
      display: `grid`,
      gridTemplateRows: `repeat(2, auto)`,
      gridTemplateAreas: `"content" "example"`,
      gridGap: 2,
      [mediaQueries.lg]: {
        gridTemplateRows: displayCodeFullWidth ? `repeat(2, auto)` : `1fr`,
        gridTemplateColumns: displayCodeFullWidth ? `auto` : `repeat(2, 1fr)`,
        gridTemplateAreas: displayCodeFullWidth
          ? `"content" "example"`
          : `"example content"`,
        gridGap: 6,
      },
      "& p:last-child": {
        mb: 0,
      },
    }}
  >
    {children}
  </div>
)

export default function LayerModel({
  layers,
  displayCodeFullWidth = false,
  initialLayer = layers[0].title,
}) {
  const [selected, setSelected] = useState(initialLayer)
  const refs = useRef(layers.map(() => React.createRef()))
  const currentIndex = layers.findIndex(layer => layer.title === selected)

  function downHandler({ key }) {
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

  const { example, text } = layers[currentIndex]

  return (
    <div
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: `ui.border`,
        padding: 2,
        mb: 6,
      }}
    >
      <div sx={{ borderRadius: 3, backgroundColor: `ui.background` }}>
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
            <LayerTab
              key={index}
              ref={refs.current[index]}
              index={index}
              layer={layer}
              onClick={() => setSelected(layer.title)}
              selected={selected === layer.title}
            />
          ))}
        </div>
      </div>
      <LayerContentWrapper
        index={currentIndex}
        displayCodeFullWidth={displayCodeFullWidth}
      >
        <div sx={{ gridArea: `example`, borderRadius: 2, overflow: `auto` }}>
          {example}
        </div>
        <div>{text}</div>
      </LayerContentWrapper>
    </div>
  )
}
