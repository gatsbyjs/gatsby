/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState, useEffect, useRef } from "react"

import LayerTab from "./layer-tab"

const LayerContentWrapper = ({
  index,
  displayCodeFullWidth = false,
  children,
}) => (
  <div
    id={`tabpanel${index}`}
    aria-labelledby={`tab${index}`}
    role="tabpanel"
    sx={theme => ({
      pt: theme.space[5],
      px: 0,
      display: `grid`,
      gridTemplateRows: `repeat(2, auto)`,
      gridTemplateAreas: `"content" "example"`,
      gridGap: theme.space[3],
      [theme.mediaQueries.desktop]: {
        gridTemplateRows: displayCodeFullWidth ? `repeat(2, auto)` : `1fr`,
        gridTemplateColumns: displayCodeFullWidth ? `auto` : `repeat(2, 1fr)`,
        gridTemplateAreas: displayCodeFullWidth
          ? `"content" "example"`
          : `"example content"`,
        gridGap: theme.space[7],
      },
      "& p:last-child": {
        mb: 0,
      },
    })}
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

  useEffect(() => {
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
    window.addEventListener(`keydown`, downHandler)
    return () => {
      window.removeEventListener(`keydown`, downHandler)
    }
  }, [selected, currentIndex, layers])

  const { example, text } = layers[currentIndex]

  return (
    <div
      sx={{
        borderRadius: 3,
        border: t => `1px solid ${t.colors.standardLine}`,
        padding: t => t.space[3],
        mb: t => t.space[7],
      }}
    >
      <div
        sx={{
          borderRadius: 3,
          backgroundColor: `secondaryBackground`,
        }}
      >
        <div
          role="tablist"
          sx={{
            display: `grid`,
            gridTemplateColumns: `repeat(${layers.length}, 1fr)`,
            gridGap: t => t.space[2],
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
