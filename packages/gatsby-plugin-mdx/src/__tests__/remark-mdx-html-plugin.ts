import type { Node } from "unist"

import { visit } from "unist-util-visit"
import { createProcessor } from "@mdx-js/mdx"
import { remarkMdxHtmlPlugin } from "../remark-mdx-html-plugin"

export const remarkHTMLInjector = () =>
  async function transformer(markdownAST: Node): Promise<Node> {
    visit(markdownAST, [`root`], node => {
      if (Array.isArray(node.children)) {
        node.children.push({ type: `html`, value: `<hr/>` })
        node.children.push({
          type: `raw`,
          value: `<marquee direction="up">Things from the past</marquee>`,
        })
      }
    })
    return markdownAST
  }

export const remarkMDASTInjector = () =>
  async function transformer(markdownAST: Node): Promise<Node> {
    visit(markdownAST, [`root`], node => {
      if (Array.isArray(node.children)) {
        node.children.push({
          type: `link`,
          url: `#`,
          title: null,
          children: [],
          data: {
            hProperties: {
              "aria-label": `some permalink`,
              class: `customClass`,
            },
            hChildren: [
              {
                type: `raw`,
                value: `<img src="" alt="" />`,
              },
            ],
          },
        })
      }
    })
    return markdownAST
  }

const source = `# Headline`

describe(`remark: support old remark plugins that add raw and html nodes`, () => {
  it(`turn html and raw nodes into `, async () => {
    const processor = createProcessor({
      remarkPlugins: [remarkHTMLInjector, remarkMdxHtmlPlugin],
    })

    await expect(processor.process(source)).resolves.toMatchInlineSnapshot(`
            VFile {
              "cwd": "<PROJECT_ROOT>",
              "data": Object {},
              "history": Array [],
              "map": undefined,
              "messages": Array [],
              "value": "/*@jsxRuntime automatic @jsxImportSource react*/
            import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
            function _createMdxContent(props) {
              const _components = Object.assign({
                h1: \\"h1\\",
                span: \\"span\\"
              }, props.components);
              return _jsxs(_Fragment, {
                children: [_jsx(_components.h1, {
                  children: \\"Headline\\"
                }), \\"/n\\", _jsx(_components.span, {
                  dangerouslySetInnerHTML: {
                    __html: \\"<hr/>\\"
                  }
                }), \\"/n\\", _jsx(_components.span, {
                  dangerouslySetInnerHTML: {
                    __html: \\"<marquee direction=/\\"up/\\">Things from the past</marquee>\\"
                  }
                })]
              });
            }
            function MDXContent(props = {}) {
              const {wrapper: MDXLayout} = props.components || ({});
              return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {
                children: _jsx(_createMdxContent, props)
              })) : _createMdxContent(props);
            }
            export default MDXContent;
            ",
            }
          `)
  })
  it(`fails when plugin is missing but remark plugins add html/raw nodes`, async () => {
    const processor = createProcessor({
      remarkPlugins: [remarkHTMLInjector],
    })

    await expect(processor.process(source)).rejects.toMatchInlineSnapshot(
      `[Error: Cannot handle unknown node \`raw\`]`
    )
  })
  it(`turns MDAST nodes created by some gatsby-remark-* plugins into HAST nodes`, async () => {
    const processor = createProcessor({
      remarkPlugins: [remarkMDASTInjector, remarkMdxHtmlPlugin],
    })

    await expect(processor.process(source)).resolves.toMatchInlineSnapshot(`
            VFile {
              "cwd": "<PROJECT_ROOT>",
              "data": Object {},
              "history": Array [],
              "map": undefined,
              "messages": Array [],
              "value": "/*@jsxRuntime automatic @jsxImportSource react*/
            import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
            function _createMdxContent(props) {
              const _components = Object.assign({
                h1: \\"h1\\",
                div: \\"div\\",
                span: \\"span\\"
              }, props.components);
              return _jsxs(_Fragment, {
                children: [_jsx(_components.h1, {
                  children: \\"Headline\\"
                }), \\"/n\\", _jsx(_components.div, {
                  \\"aria-label\\": \\"some permalink\\",
                  className: \\"customClass\\",
                  children: _jsx(_components.span, {
                    dangerouslySetInnerHTML: {
                      __html: \\"<img src=/\\"/\\" alt=/\\"/\\" />\\"
                    }
                  })
                })]
              });
            }
            function MDXContent(props = {}) {
              const {wrapper: MDXLayout} = props.components || ({});
              return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {
                children: _jsx(_createMdxContent, props)
              })) : _createMdxContent(props);
            }
            export default MDXContent;
            ",
            }
          `)
  })
})
