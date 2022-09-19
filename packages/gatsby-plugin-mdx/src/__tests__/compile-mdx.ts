import { readFileSync } from "fs"
import path from "path"
import { mockGatsbyApi } from "../__fixtures__/test-utils"

import { compileMDX, compileMDXWithCustomOptions } from "../compile-mdx"

const exampleMdxPath = path.resolve(
  __dirname,
  `..`,
  `__fixtures__`,
  `example.mdx`
)
const exampleMdxContent = readFileSync(exampleMdxPath)

const { reporter, cache } = mockGatsbyApi()

describe(`compiles MDX`, () => {
  it(`default`, async () => {
    await expect(
      compileMDX(
        { absolutePath: exampleMdxPath, source: exampleMdxContent.toString() },
        {},
        cache,
        reporter
      )
    ).resolves.toMatchInlineSnapshot(`
            Object {
              "metadata": Object {},
              "processedMDX": "/*@jsxRuntime automatic @jsxImportSource react*/
            import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
            function _createMdxContent(props) {
              const _components = Object.assign({
                h1: \\"h1\\",
                p: \\"p\\",
                strong: \\"strong\\"
              }, props.components), {Example} = _components;
              if (!Example) _missingMdxReference(\\"Example\\", true);
              return _jsxs(_Fragment, {
                children: [_jsx(_components.h1, {
                  children: \\"Hello\\"
                }), \\"/n\\", _jsxs(_components.p, {
                  children: [\\"This is \\", _jsx(_components.strong, {
                    children: \\"MDX\\"
                  })]
                }), \\"/n\\", _jsx(Example, {})]
              });
            }
            function MDXContent(props = {}) {
              const {wrapper: MDXLayout} = props.components || ({});
              return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {
                children: _jsx(_createMdxContent, props)
              })) : _createMdxContent(props);
            }
            export default MDXContent;
            function _missingMdxReference(id, component) {
              throw new Error(\\"Expected \\" + (component ? \\"component\\" : \\"object\\") + \\" \`\\" + id + \\"\` to be defined: you likely forgot to import, pass, or provide it.\\");
            }
            ",
            }
          `)
  })
})
