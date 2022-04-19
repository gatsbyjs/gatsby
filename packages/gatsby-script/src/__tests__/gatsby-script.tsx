/**
 * @jest-environment jsdom
 */

import React from "react"
import { render } from "@testing-library/react"
import { Script, ScriptStrategy } from "../gatsby-script"

const scripts: Record<string, string> = {
  react: `https://unpkg.com/react@18/umd/react.development.js`,
  inline: `console.log('Hello world!')`,
}

const strategies: Array<ScriptStrategy> = [
  ScriptStrategy.preHydrate,
  ScriptStrategy.postHydrate,
  ScriptStrategy.idle,
]

describe(`Script`, () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.requestIdleCallback = jest.fn<any, any>(callback => callback())
  })

  afterEach(() => {
    while (document.body.hasChildNodes()) {
      document.body.lastElementChild?.remove()
    }
  })

  it(`should default to a post-hydrate strategy`, async () => {
    const { container } = render(<Script src={scripts.react} />)
    const script = container.parentElement.querySelector(`script`)
    expect(script.getAttribute(`data-strategy`)).toEqual(
      ScriptStrategy.postHydrate
    )
  })

  it(`should be possible to declare a pre-hydrate strategy`, () => {
    const { container } = render(
      <Script src={scripts.react} strategy={ScriptStrategy.preHydrate} />
    )
    const script = container.parentElement.querySelector(`script`)
    expect(script.getAttribute(`data-strategy`)).toEqual(
      ScriptStrategy.preHydrate
    )
  })

  it(`should be possible to declare a post-hydrate strategy`, () => {
    const { container } = render(
      <Script src={scripts.react} strategy={ScriptStrategy.postHydrate} />
    )
    const script = container.parentElement.querySelector(`script`)
    expect(script.getAttribute(`data-strategy`)).toEqual(
      ScriptStrategy.postHydrate
    )
  })

  it(`should be possible to declare an idle strategy`, () => {
    const { container } = render(
      <Script src={scripts.react} strategy={ScriptStrategy.idle} />
    )
    const script = container.parentElement.querySelector(`script`)
    expect(script.getAttribute(`data-strategy`)).toEqual(ScriptStrategy.idle)
  })

  it(`should apply an async attribute when a pre-hydrate strategy is declared`, () => {
    const { container } = render(
      <Script src={scripts.react} strategy={ScriptStrategy.preHydrate} />
    )
    const script = container.parentElement.querySelector(`script`)
    expect(script.getAttribute(`async`)).not.toBeNull()
  })

  it(`should include inline scripts passed via the dangerouslySetInnerHTML prop in the DOM`, () => {
    for (const strategy of strategies) {
      const { container } = render(
        <Script
          strategy={strategy}
          dangerouslySetInnerHTML={{ __html: scripts.inline }}
        />
      )
      const script = container.parentElement.querySelector(`script`)
      expect(script.textContent).toBe(scripts.inline)
    }
  })

  it(`should include inline scripts passed via template literals in the DOM`, () => {
    for (const strategy of strategies) {
      const { container } = render(
        <Script strategy={strategy}>{scripts.inline}</Script>
      )
      const script = container.parentElement.querySelector(`script`)
      expect(script.textContent).toBe(scripts.inline)
    }
  })

  it(`should apply normal attributes`, () => {
    const lines = {
      first: `It's the bear necessities`,
      second: `the simple bear necessities`,
      third: `forget about your worries and your strife`,
    }

    for (const strategy of strategies) {
      const { container } = render(
        <Script
          src={scripts.react}
          strategy={strategy}
          data-first={lines.first}
          data-second={lines.second}
          data-third={lines.third}
        ></Script>
      )

      const script = container.parentElement.querySelector(`script`)

      expect(script.dataset.first).toBe(lines.first)
      expect(script.dataset.second).toBe(lines.second)
      expect(script.dataset.third).toBe(lines.third)
    }
  })
})
