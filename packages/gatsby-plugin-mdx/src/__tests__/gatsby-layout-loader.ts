import { LoaderContext } from "webpack"
import { createFileToMdxCacheKey } from "../cache-helpers"
import gatsbyLayoutLoader from "../gatsby-layout-loader"
import gatsbyMDXLoader from "../gatsby-mdx-loader"
import { mockGatsbyApi } from "../__fixtures__/test-utils"

const { cache, getNode, reporter } = mockGatsbyApi()

const exampleMDX = `# Layout test

Does it wrap?

<Example/>`

const nodeExists: () => boolean = () => true

const getNodeMock = getNode as jest.Mock

const resourcePath = `/mocked`
const resourceQuery = `mocked`

const parseMDX = async (source: string): Promise<string | Buffer | void> => {
  getNodeMock.mockImplementation(() => {
    return {
      body: source,
    }
  })

  const JSXSource = await gatsbyMDXLoader.call(
    {
      getOptions: () => {
        return {
          options: {},
          getNode,
          cache,
          reporter,
        }
      },
      resourcePath,
      resourceQuery,
      addDependency: jest.fn(),
    } as unknown as LoaderContext<string>,
    source
  )
  getNodeMock.mockImplementation(() => {
    return {
      body: JSXSource,
    }
  })

  const loaderPromise = gatsbyLayoutLoader.call(
    {
      getOptions: () => {
        return {
          nodeExists,
          reporter,
        }
      },
      resourcePath: `/mocked-layout.ts`,
      resourceQuery: `?contentFilePath=/mocked-content.mdx`,
      addDependency: jest.fn(),
    } as unknown as LoaderContext<string>,
    String(JSXSource)
  )

  return loaderPromise
}

describe(`webpack loader: loads and injects Gatsby layout component`, () => {
  cache.set(createFileToMdxCacheKey(resourcePath), 123)

  it(`MDX without layout`, async () => {
    await expect(parseMDX(exampleMDX)).resolves.toMatchInlineSnapshot(`
            "import React from \\"react\\";
            import GATSBY_COMPILED_MDX from \\"/mocked-layout.ts?contentFilePath=/mocked-content.mdx\\";
            import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
            function _createMdxContent(props) {
              const _components = Object.assign({
                h1: \\"h1\\",
                p: \\"p\\"
              }, props.components), {Example} = _components;
              if (!Example) _missingMdxReference(\\"Example\\", true);
              return _jsxs(_Fragment, {
                children: [_jsx(_components.h1, {
                  children: \\"Layout test\\"
                }), \\"/n\\", _jsx(_components.p, {
                  children: \\"Does it wrap?\\"
                }), \\"/n\\", _jsx(Example, {})]
              });
            }
            function MDXContent(props = {}) {
              const {wrapper: MDXLayout} = props.components || ({});
              return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {
                children: _jsx(_createMdxContent, props)
              })) : _createMdxContent(props);
            }
            MDXContent
            export default function GatsbyMDXWrapper(props) {
              return React.createElement(MDXContent, props, React.createElement(GATSBY_COMPILED_MDX, props));
            }
            function _missingMdxReference(id, component) {
              throw new Error(\\"Expected \\" + (component ? \\"component\\" : \\"object\\") + \\" \`\\" + id + \\"\` to be defined: you likely forgot to import, pass, or provide it.\\");
            }
            "
          `)
  })
  it(`MDX with imported layout as default export`, async () => {
    await expect(
      parseMDX(
        `import TemplateComponent from "./some-path"\n\n${exampleMDX}\n\nexport default TemplateComponent`
      )
    ).resolves.toMatchInlineSnapshot(`
            "import React from \\"react\\";
            import GATSBY_COMPILED_MDX from \\"/mocked-layout.ts?contentFilePath=/mocked-content.mdx\\";
            import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
            import TemplateComponent from \\"./some-path\\";
            const MDXLayout = TemplateComponent;
            function _createMdxContent(props) {
              const _components = Object.assign({
                h1: \\"h1\\",
                p: \\"p\\"
              }, props.components), {Example} = _components;
              if (!Example) _missingMdxReference(\\"Example\\", true);
              return _jsxs(_Fragment, {
                children: [_jsx(_components.h1, {
                  children: \\"Layout test\\"
                }), \\"/n\\", _jsx(_components.p, {
                  children: \\"Does it wrap?\\"
                }), \\"/n\\", _jsx(Example, {})]
              });
            }
            function MDXContent(props = {}) {
              return _jsx(MDXLayout, Object.assign({}, props, {
                children: _jsx(_createMdxContent, props)
              }));
            }
            MDXContent
            export default function GatsbyMDXWrapper(props) {
              return React.createElement(MDXContent, props, React.createElement(GATSBY_COMPILED_MDX, props));
            }
            function _missingMdxReference(id, component) {
              throw new Error(\\"Expected \\" + (component ? \\"component\\" : \\"object\\") + \\" \`\\" + id + \\"\` to be defined: you likely forgot to import, pass, or provide it.\\");
            }
            "
          `)
  })
  it(`MDX with layout exporting default directly`, async () => {
    await expect(
      parseMDX(`${exampleMDX}\n\nexport {default} from "./some-path"`)
    ).resolves.toMatchInlineSnapshot(`
            "import React from \\"react\\";
            import GATSBY_COMPILED_MDX from \\"/mocked-layout.ts?contentFilePath=/mocked-content.mdx\\";
            import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
            import MDXLayout from \\"./some-path\\";
            function _createMdxContent(props) {
              const _components = Object.assign({
                h1: \\"h1\\",
                p: \\"p\\"
              }, props.components), {Example} = _components;
              if (!Example) _missingMdxReference(\\"Example\\", true);
              return _jsxs(_Fragment, {
                children: [_jsx(_components.h1, {
                  children: \\"Layout test\\"
                }), \\"/n\\", _jsx(_components.p, {
                  children: \\"Does it wrap?\\"
                }), \\"/n\\", _jsx(Example, {})]
              });
            }
            function MDXContent(props = {}) {
              return _jsx(MDXLayout, Object.assign({}, props, {
                children: _jsx(_createMdxContent, props)
              }));
            }
            MDXContent
            export default function GatsbyMDXWrapper(props) {
              return React.createElement(MDXContent, props, React.createElement(GATSBY_COMPILED_MDX, props));
            }
            function _missingMdxReference(id, component) {
              throw new Error(\\"Expected \\" + (component ? \\"component\\" : \\"object\\") + \\" \`\\" + id + \\"\` to be defined: you likely forgot to import, pass, or provide it.\\");
            }
            "
          `)
  })
  it(`MDX with layout exporting named default directly`, async () => {
    await expect(
      parseMDX(`${exampleMDX}\n\nexport {Layout as default} from "./some-path"`)
    ).resolves.toMatchInlineSnapshot(`
            "import React from \\"react\\";
            import GATSBY_COMPILED_MDX from \\"/mocked-layout.ts?contentFilePath=/mocked-content.mdx\\";
            import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
            import {Layout as MDXLayout} from \\"./some-path\\";
            function _createMdxContent(props) {
              const _components = Object.assign({
                h1: \\"h1\\",
                p: \\"p\\"
              }, props.components), {Example} = _components;
              if (!Example) _missingMdxReference(\\"Example\\", true);
              return _jsxs(_Fragment, {
                children: [_jsx(_components.h1, {
                  children: \\"Layout test\\"
                }), \\"/n\\", _jsx(_components.p, {
                  children: \\"Does it wrap?\\"
                }), \\"/n\\", _jsx(Example, {})]
              });
            }
            function MDXContent(props = {}) {
              return _jsx(MDXLayout, Object.assign({}, props, {
                children: _jsx(_createMdxContent, props)
              }));
            }
            MDXContent
            export default function GatsbyMDXWrapper(props) {
              return React.createElement(MDXContent, props, React.createElement(GATSBY_COMPILED_MDX, props));
            }
            function _missingMdxReference(id, component) {
              throw new Error(\\"Expected \\" + (component ? \\"component\\" : \\"object\\") + \\" \`\\" + id + \\"\` to be defined: you likely forgot to import, pass, or provide it.\\");
            }
            "
          `)
  })
})
