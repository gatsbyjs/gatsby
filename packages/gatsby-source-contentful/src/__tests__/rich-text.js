import React from "react"
import { render } from "@testing-library/react"
import { renderRichText } from "../rich-text"
import { BLOCKS, INLINES } from "@contentful/rich-text-types"
import { getRichTextEntityLinks } from "@contentful/rich-text-links"
import { initialSync } from "../__fixtures__/rich-text-data"
import { cloneDeep } from "lodash"

const json = {
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
}

const fixtures = initialSync().currentSyncData
const fixturesEntriesMap = new Map()
const fixturesAssetsMap = new Map()

fixtures.entries.forEach(entity =>
  fixturesEntriesMap.set(entity.sys.id, { sys: entity.sys, ...entity.fields })
)
fixtures.assets.forEach(entity =>
  fixturesAssetsMap.set(entity.sys.id, { sys: entity.sys, ...entity.fields })
)

const links = {
  assets: {
    block: getRichTextEntityLinks(json, `embedded-asset-block`)[
      `Asset`
    ].map(entity => fixturesAssetsMap.get(entity.id)),
    hyperlink: getRichTextEntityLinks(json, `asset-hyperlink`)[
      `Asset`
    ].map(entity => fixturesAssetsMap.get(entity.id)),
  },
  entries: {
    inline: getRichTextEntityLinks(json, `embedded-entry-inline`)[
      `Entry`
    ].map(entity => fixturesEntriesMap.get(entity.id)),
    block: getRichTextEntityLinks(json, `embedded-entry-block`)[
      `Entry`
    ].map(entity => fixturesEntriesMap.get(entity.id)),
    hyperlink: getRichTextEntityLinks(json, `entry-hyperlink`)[
      `Entry`
    ].map(entity => fixturesEntriesMap.get(entity.id)),
  },
}

describe(`rich text`, () => {
  test(`renders with default options`, () => {
    const { container } = render(
      renderRichText({ json: cloneDeep(json), links: cloneDeep(links) })
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders with custom options`, () => {
    const makeOptions = ({
      assetBlockMap,
      assetHyperlinkMap,
      entryBlockMap,
      entryInlineMap,
      entryHyperlinkMap,
    }) => {
      return {
        renderNode: {
          [INLINES.EMBEDDED_ENTRY]: node => {
            const entry = entryInlineMap.get(node?.data?.target?.sys.id)
            if (!entry) {
              return (
                <span>
                  Unresolved INLINE ENTRY:{` `}
                  {JSON.stringify({ node, entryInlineMap }, null, 2)}
                </span>
              )
            }
            return <span>Resolved inline Entry ({entry.sys.id})</span>
          },
          [INLINES.ENTRY_HYPERLINK]: node => {
            const entry = entryHyperlinkMap.get(node?.data?.target?.sys.id)
            if (!entry) {
              return (
                <span>
                  Unresolved ENTRY HYPERLINK: {JSON.stringify(node, null, 2)}
                </span>
              )
            }
            return <span>Resolved entry Hyperlink ({entry.sys.id})</span>
          },
          [INLINES.ASSET_HYPERLINK]: node => {
            const entry = assetHyperlinkMap.get(node?.data?.target?.sys.id)
            if (!entry) {
              return (
                <span>
                  Unresolved ASSET HYPERLINK: {JSON.stringify(node, null, 2)}
                </span>
              )
            }
            return <span>Resolved asset Hyperlink ({entry.sys.id})</span>
          },
          [BLOCKS.EMBEDDED_ENTRY]: node => {
            const entry = entryBlockMap.get(node?.data?.target?.sys.id)
            if (!entry) {
              return (
                <div>
                  Unresolved ENTRY !!!!": {JSON.stringify(node, null, 2)}
                </div>
              )
            }
            return (
              <h2>
                Resolved embedded Entry: {entry.title[`en-US`]} ({entry.sys.id})
              </h2>
            )
          },
          [BLOCKS.EMBEDDED_ASSET]: node => {
            const entry = assetBlockMap.get(node?.data?.target?.sys.id)
            if (!entry) {
              return (
                <div>
                  Unresolved ASSET !!!!": {JSON.stringify(node, null, 2)}
                </div>
              )
            }
            return (
              <h2>
                Resolved embedded Asset: {entry.title[`en-US`]} ({entry.sys.id})
              </h2>
            )
          },
        },
      }
    }

    const { container } = render(
      renderRichText(
        { json: cloneDeep(json), links: cloneDeep(links) },
        makeOptions
      )
    )
    expect(container).toMatchSnapshot()
  })
})
