import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import theme from "../../../../src/gatsby-plugin-theme-ui"
import CodeBlock from ".."

describe(`basic functionality`, () => {
  describe(`copy`, () => {
    it(`renders a copy button`, () => {
      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <CodeBlock language="jsx">{`var a = 'b'`}</CodeBlock>
        </ThemeProvider>
      )

      expect(queryByText(`copy`)).toBeDefined()
    })
  })

  describe(`highlighting`, () => {
    let instance
    const hidden = `var a = 'i will be hidden'`
    const highlighted = `
    <div>
      <h1>Oh shit waddup</h1>
    </div>
    `.trim()
    beforeEach(() => {
      const text = `
      import * as React from 'react'

      ${hidden} // hide-line

      export default function HelloWorld() {
        return (
          {/* highlight-start */}
          ${highlighted}
          {/* highlight-end */}
        )
      }
    `.trim()
      instance = render(
        <ThemeProvider theme={theme}>
          <CodeBlock language="jsx">{text}</CodeBlock>
        </ThemeProvider>
      )
    })

    it(`hides lines appropriately`, () => {
      expect(instance.queryByText(hidden)).toBeNull()
    })

    it(`highlights lines appropriately`, () => {
      const lines = highlighted.split(`\n`)
      expect(
        instance.container.querySelectorAll(`.gatsby-highlight-code-line`)
      ).toHaveLength(lines.length)
    })
  })
})
