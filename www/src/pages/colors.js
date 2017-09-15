import React from "react"
import colors from "../utils/colors"
import { rhythm, options } from "../utils/typography"
import Container from "../components/container"
import range from "lodash/range"

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
              textAlign: `center`,
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
    </div>
  </Container>
)
