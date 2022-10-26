/**
 * @jest-environment jsdom
 */

import { diffNodes } from "../utils"

function createElement(
  type: string,
  attributes: Record<string, string> | undefined = undefined,
  innerHTML: string | undefined = undefined
): Element {
  const element: Element = document.createElement(type)
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value === `string`) {
        element.setAttribute(key, value)
      }
    }
  }
  if (innerHTML) {
    element.innerHTML = innerHTML
  }
  return element
}

describe(`diffNodes`, () => {
  it(`should keep same nodes, remove nodes that were not re-created, and add new nodes`, () => {
    const oldNodes = [
      createElement(`title`, {}, `to remove`),
      createElement(`script`, {}, `stable`),
      createElement(`script`, {}, `to remove`),
    ]

    const newNodes = [
      createElement(`title`, {}, `to add`),
      createElement(`script`, {}, `stable`),
      createElement(`script`, {}, `to add`),
    ]

    const onStale = jest.fn()
    const onNew = jest.fn()

    diffNodes({ oldNodes, newNodes, onStale, onNew })

    expect(onStale.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          <title>
            to remove
          </title>,
        ],
        Array [
          <script>
            to remove
          </script>,
        ],
      ]
    `)
    expect(onNew.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          <title>
            to add
          </title>,
        ],
        Array [
          <script>
            to add
          </script>,
        ],
      ]
    `)
  })
})
