/**
 * @jest-environment jsdom
 */

import { diffNodes, getValidHeadNodesAndAttributes } from "../utils"

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

/**
 * Creates an element in the SVG namespace to simulate React 19's behavior
 * where elements rendered inside an SVG wrapper inherit the SVG namespace.
 */
function createSVGNamespaceElement(
  type: string,
  attributes: Record<string, string> | undefined = undefined
): Element {
  const SVG_NAMESPACE = `http://www.w3.org/2000/svg`
  const element = document.createElementNS(SVG_NAMESPACE, type)
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value)
    }
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

describe(`getValidHeadNodesAndAttributes`, () => {
  const HTML_NAMESPACE = `http://www.w3.org/1999/xhtml`
  const SVG_NAMESPACE = `http://www.w3.org/2000/svg`

  it(`should recreate elements in the HTML namespace even if source elements are in SVG namespace`, () => {
    // Simulate React 19's behavior where elements inside an SVG wrapper
    // are created in the SVG namespace
    const rootNode = document.createElement(`div`)

    const svgMeta = createSVGNamespaceElement(`meta`, {
      name: `description`,
      content: `Test`,
    })
    const svgTitle = createSVGNamespaceElement(`title`)
    svgTitle.textContent = `Test Title`
    const svgLink = createSVGNamespaceElement(`link`, {
      rel: `canonical`,
      href: `https://example.com`,
    })

    rootNode.appendChild(svgMeta)
    rootNode.appendChild(svgTitle)
    rootNode.appendChild(svgLink)

    // Verify source elements are in SVG namespace
    expect(svgMeta.namespaceURI).toBe(SVG_NAMESPACE)
    expect(svgTitle.namespaceURI).toBe(SVG_NAMESPACE)
    expect(svgLink.namespaceURI).toBe(SVG_NAMESPACE)

    const { validHeadNodes } = getValidHeadNodesAndAttributes(rootNode)

    // Verify all output elements are in HTML namespace
    expect(validHeadNodes).toHaveLength(3)
    for (const node of validHeadNodes) {
      expect(node.namespaceURI).toBe(HTML_NAMESPACE)
    }

    // Verify the elements are proper HTML elements with correct properties
    const metaNode = validHeadNodes[0] as HTMLMetaElement
    expect(metaNode.name).toBe(`description`)
    expect(metaNode.content).toBe(`Test`)

    const titleNode = validHeadNodes[1] as HTMLTitleElement
    expect(titleNode.text).toBe(`Test Title`)

    const linkNode = validHeadNodes[2] as HTMLLinkElement
    expect(linkNode.rel).toBe(`canonical`)
    expect(linkNode.href).toBe(`https://example.com/`)
  })

  it(`should preserve attributes when recreating elements`, () => {
    const rootNode = document.createElement(`div`)
    const meta = createSVGNamespaceElement(`meta`, {
      name: `viewport`,
      content: `width=device-width, initial-scale=1`,
    })
    rootNode.appendChild(meta)

    const { validHeadNodes } = getValidHeadNodesAndAttributes(rootNode)

    expect(validHeadNodes).toHaveLength(1)
    const resultMeta = validHeadNodes[0] as HTMLMetaElement
    expect(resultMeta.getAttribute(`name`)).toBe(`viewport`)
    expect(resultMeta.getAttribute(`content`)).toBe(
      `width=device-width, initial-scale=1`
    )
    expect(resultMeta.getAttribute(`data-gatsby-head`)).toBe(`true`)
  })
})
