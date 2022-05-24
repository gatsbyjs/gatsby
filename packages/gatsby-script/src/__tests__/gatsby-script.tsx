/**
 * @jest-environment jsdom
 */

import React from "react"
import { render } from "@testing-library/react/pure"
import { Script, ScriptStrategy, scriptCache } from "../gatsby-script"

const scripts: Record<string, string> = {
  react: `https://unpkg.com/react@18/umd/react.development.js`,
  inline: `console.log('Hello world!')`,
}

const strategies: Array<ScriptStrategy> = [
  ScriptStrategy.postHydrate,
  ScriptStrategy.idle,
]

jest.mock(`../request-idle-callback-shim`, () => {
  const originalModule = jest.requireActual(`../request-idle-callback-shim`)

  return {
    __esModule: true,
    ...originalModule,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestIdleCallback: jest.fn<any, any>(callback => callback()),
  }
})

describe(`Script`, () => {
  beforeAll(() => {
    // @ts-ignore Mock it out for now
    performance.getEntriesByName = jest.fn(() => [])
  })

  afterEach(() => {
    scriptCache.delete(scripts.react)
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

  it(`should be possible to declare an off-main-thread strategy`, () => {
    const { container } = render(
      <Script src={scripts.react} strategy={ScriptStrategy.offMainThread} />
    )
    const script = container.parentElement.querySelector(`script`)
    expect(script.getAttribute(`data-strategy`)).toEqual(
      ScriptStrategy.offMainThread
    )
    expect(script.getAttribute(`type`)).toEqual(`text/partytown`)
  })

  it(`should include inline scripts passed via the dangerouslySetInnerHTML prop in the DOM`, () => {
    for (const strategy of strategies) {
      const { container } = render(
        <Script
          id="a"
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
        <Script id="b" strategy={strategy}>
          {scripts.inline}
        </Script>
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
