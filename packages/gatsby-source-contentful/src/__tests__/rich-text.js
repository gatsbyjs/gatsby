/**
 * @jest-environment jsdom
 */

// @ts-check
import React from "react"
import { render } from "@testing-library/react"
import { renderRichText } from "gatsby-source-contentful/rich-text"
import { BLOCKS, INLINES } from "@contentful/rich-text-types"
import { initialSync } from "../__fixtures__/rich-text-data"
import { cloneDeep } from "lodash"

const raw = JSON.stringify({
  nodeType: `document`,
  data: {},
  content: [
    {
      nodeType: `paragraph`,
      content: [
        {
          nodeType: `text`,
          value: `This is the homepage`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-1`,
      content: [
        {
          nodeType: `text`,
          value: `Heading 1`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-2`,
      content: [
        {
          nodeType: `text`,
          value: `Heading 2`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-3`,
      content: [
        {
          nodeType: `text`,
          value: `Heading 3`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-4`,
      content: [
        {
          nodeType: `text`,
          value: `Heading 4`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-5`,
      content: [
        {
          nodeType: `text`,
          value: `Heading 5`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-6`,
      content: [
        {
          nodeType: `text`,
          value: `Heading 6`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `paragraph`,
      content: [
        {
          nodeType: `text`,
          value: `This is `,
          marks: [],
          data: {},
        },
        {
          nodeType: `text`,
          value: `bold `,
          marks: [
            {
              type: `bold`,
            },
          ],
          data: {},
        },
        {
          nodeType: `text`,
          value: `and `,
          marks: [],
          data: {},
        },
        {
          nodeType: `text`,
          value: `italic`,
          marks: [
            {
              type: `italic`,
            },
          ],
          data: {},
        },
        {
          nodeType: `text`,
          value: ` and `,
          marks: [],
          data: {},
        },
        {
          nodeType: `text`,
          value: `both`,
          marks: [
            {
              type: `bold`,
            },
            {
              type: `italic`,
            },
          ],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `unordered-list`,
      content: [
        {
          nodeType: `list-item`,
          content: [
            {
              nodeType: `paragraph`,
              content: [
                {
                  nodeType: `text`,
                  value: `Very`,
                  marks: [],
                  data: {},
                },
              ],
              data: {},
            },
          ],
          data: {},
        },
        {
          nodeType: `list-item`,
          content: [
            {
              nodeType: `paragraph`,
              content: [
                {
                  nodeType: `text`,
                  value: `useful`,
                  marks: [],
                  data: {},
                },
              ],
              data: {},
            },
          ],
          data: {},
        },
        {
          nodeType: `list-item`,
          content: [
            {
              nodeType: `paragraph`,
              content: [
                {
                  nodeType: `text`,
                  value: `list`,
                  marks: [],
                  data: {},
                },
              ],
              data: {},
            },
          ],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `blockquote`,
      content: [
        {
          nodeType: `paragraph`,
          content: [
            {
              nodeType: `text`,
              value: `This is a quote`,
              marks: [],
              data: {},
            },
          ],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-2`,
      content: [
        {
          nodeType: `text`,
          value: `Reference tests:`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `paragraph`,
      content: [
        {
          nodeType: `text`,
          value: `Inline Link: `,
          marks: [],
          data: {},
        },
        {
          nodeType: `embedded-entry-inline`,
          content: [],
          data: {
            target: {
              sys: {
                id: `7oHxo6bs0us9wIkq27qdyK`,
                type: `Link`,
                linkType: `Entry`,
              },
            },
          },
        },
        {
          nodeType: `text`,
          value: ``,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `paragraph`,
      content: [
        {
          nodeType: `text`,
          value: `Link in list:`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `ordered-list`,
      content: [
        {
          nodeType: `list-item`,
          content: [
            {
              nodeType: `paragraph`,
              content: [
                {
                  nodeType: `text`,
                  value: ``,
                  marks: [],
                  data: {},
                },
                {
                  nodeType: `embedded-entry-inline`,
                  content: [],
                  data: {
                    target: {
                      sys: {
                        id: `6KpLS2NZyB3KAvDzWf4Ukh`,
                        type: `Link`,
                        linkType: `Entry`,
                      },
                    },
                  },
                },
                {
                  nodeType: `text`,
                  value: ``,
                  marks: [],
                  data: {},
                },
              ],
              data: {},
            },
          ],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `paragraph`,
      content: [
        {
          nodeType: `text`,
          value: `Embedded Entity:`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `embedded-entry-block`,
      content: [],
      data: {
        target: {
          sys: {
            id: `7oHxo6bs0us9wIkq27qdyK`,
            type: `Link`,
            linkType: `Entry`,
          },
        },
      },
    },
    {
      nodeType: `paragraph`,
      content: [
        {
          nodeType: `text`,
          value: ``,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `heading-2`,
      content: [
        {
          nodeType: `text`,
          value: `Embedded Asset:`,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: `embedded-asset-block`,
      content: [],
      data: {
        target: {
          sys: {
            id: `4ZQrqcrTunWiuNaavhGYNT`,
            type: `Link`,
            linkType: `Asset`,
          },
        },
      },
    },
    {
      nodeType: `paragraph`,
      content: [
        {
          nodeType: `text`,
          value: ``,
          marks: [],
          data: {},
        },
      ],
      data: {},
    },
  ],
})

const fixtures = initialSync().currentSyncData

const references = [
  ...fixtures.entries.map(entity => {
    return {
      sys: entity.sys,
      contentful_id: entity.sys.id,
      __typename: `ContentfulContent`,
      ...entity.fields,
    }
  }),
  ...fixtures.assets.map(entity => {
    return {
      sys: entity.sys,
      contentful_id: entity.sys.id,
      __typename: `ContentfulAsset`,
      ...entity.fields,
    }
  }),
]

describe(`rich text`, () => {
  test(`renders with default options`, () => {
    const { container } = render(
      <>
        {renderRichText({
          raw: cloneDeep(raw),
          references: cloneDeep(references),
        })}
      </>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders with custom options`, () => {
    const options = {
      renderNode: {
        [INLINES.EMBEDDED_ENTRY]: node => {
          if (!node.data.target) {
            return (
              <span>
                Unresolved INLINE ENTRY: {JSON.stringify(node, null, 2)}
              </span>
            )
          }
          return (
            <span>
              Resolved inline Entry ({node.data.target.contentful_id})
            </span>
          )
        },
        [INLINES.ENTRY_HYPERLINK]: node => {
          if (!node.data.target) {
            return (
              <span>
                Unresolved ENTRY HYPERLINK: {JSON.stringify(node, null, 2)}
              </span>
            )
          }
          return (
            <span>
              Resolved entry Hyperlink ({node.data.target.contentful_id})
            </span>
          )
        },
        [INLINES.ASSET_HYPERLINK]: node => {
          if (!node.data.target) {
            return (
              <span>
                Unresolved ASSET HYPERLINK: {JSON.stringify(node, null, 2)}
              </span>
            )
          }
          return (
            <span>
              Resolved asset Hyperlink ({node.data.target.contentful_id})
            </span>
          )
        },
        [BLOCKS.EMBEDDED_ENTRY]: node => {
          if (!node.data.target) {
            return (
              <div>Unresolved ENTRY !!!!": {JSON.stringify(node, null, 2)}</div>
            )
          }
          return (
            <h2>
              Resolved embedded Entry: {node.data.target.title[`en-US`]} (
              {node.data.target.contentful_id})
            </h2>
          )
        },
        [BLOCKS.EMBEDDED_ASSET]: node => {
          if (!node.data.target) {
            return (
              <div>Unresolved ASSET !!!!": {JSON.stringify(node, null, 2)}</div>
            )
          }
          return (
            <h2>
              Resolved embedded Asset: {node.data.target.title[`en-US`]} (
              {node.data.target.contentful_id})
            </h2>
          )
        },
      },
    }
    const { container } = render(
      <>
        {renderRichText(
          { raw: cloneDeep(raw), references: cloneDeep(references) },
          options
        )}
      </>
    )
    expect(container).toMatchSnapshot()
  })
})
