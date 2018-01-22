import React from "react"
import colors from "../utils/colors"
import presets from "../utils/presets"
import { rhythm, options, scale } from "../utils/typography"
import Container from "../components/container"
import range from "lodash/range"
import chroma from "chroma-js"

let palette = []

for (let [key, value] of Object.entries(presets)) {
  if (key.startsWith(`B`)) {
    palette.push(value)
  }
}

export default () => (
  <Container>
    <h1 css={{ margin: 0, marginLeft: rhythm(1 / 4) }}>Colors</h1>
    <div css={{ overflow: `hidden` }}>
      <div css={{ float: `left`, marginRight: 3, textAlign: `center` }}>
        <br />
        <br />
        <br />
        <div css={{ marginBottom: 7.5 }} />
        {range(0, 16).map(a => (
          <div
            css={{
              height: 30,
              width: 30,
              fontWeight: `bold`,
              fontFamily: options.headerFontFamily.join(`,`),
            }}
          >
            {a}
          </div>
        ))}
      </div>
      <div css={{ float: `left`, marginRight: 3, textAlign: `center` }}>
        <h4>a</h4>
        {colors.a.map(a => (
          <div css={{ height: 30, width: 30, background: a }} />
        ))}
      </div>
      <div css={{ float: `left`, marginRight: 3, textAlign: `center` }}>
        <h4>b</h4>
        {colors.b.map(a => (
          <div css={{ height: 30, width: 30, background: a }} />
        ))}
      </div>
      <div css={{ float: `left`, marginRight: 3, textAlign: `center` }}>
        <h4>c</h4>
        {colors.c.map(a => (
          <div css={{ height: 30, width: 30, background: a }} />
        ))}
      </div>
      <div css={{ float: `left`, marginRight: 3 }}>
        <h4>Chroma.js</h4>
        {presets.palette.map(a => (
          <div
            css={{
              height: 30,
              width: 240,
              ...scale(-1 / 2),
              textAlign: `left`,
              color:
                chroma(
                  `hsl(${a[0]}, ${a[1] * 100}%, ${a[2] * 100}%)`
                ).luminance() > 0.5
                  ? `black`
                  : `white`,
              fontFamily: options.monospaceFontFamily.join(`,`),
              background: `hsla(${a[0]}, ${a[1] * 100}%, ${a[2] * 100}%, 1)`,
            }}
          >
            hsl({parseFloat(Math.round(a[0]))},{` `}
            {parseFloat(Math.round(a[1] * 100))}%,{` `}
            {parseFloat(Math.round(a[2] * 100))}%) /{` `}
            {chroma(`hsla(${a[0]}, ${a[1] * 100}%, ${a[2] * 100}%, 1)`).hex()}
          </div>
        ))}
      </div>
      <div css={{ float: `left`, marginRight: 3 }}>
        <h4>Brand</h4>
        {palette.map(a => (
          <div
            css={{
              height: 30,
              width: 90,
              background: a,
              fontFamily: options.monospaceFontFamily.join(`,`),
            }}
          >
            {a}
          </div>
        ))}
      </div>
    </div>
  </Container>
)
