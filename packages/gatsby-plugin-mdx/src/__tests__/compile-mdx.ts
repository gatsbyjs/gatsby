import { readFileSync } from "fs"
import path from "path"
import { mockGatsbyApi } from "../__fixtures__/test-utils"

import { compileMDX, compileMDXWithCustomOptions } from "../compile-mdx"
import type { CompileOptions } from "@mdx-js/mdx"

const exampleMdxPath = path.resolve(
  __dirname,
  `..`,
  `__fixtures__`,
  `example.mdx`
)
const validMdNotValidMdxPath = path.resolve(
  __dirname,
  `..`,
  `__fixtures__`,
  `validMdNotValidMdx.md`
)
const exampleMdxContent = readFileSync(exampleMdxPath)
const validMdNotValidMdxContent = readFileSync(validMdNotValidMdxPath)

const { reporter, cache } = mockGatsbyApi()

const resolvesMdx = `
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
`

const resolvesMdxWithFormatMd = `
  Object {
    "metadata": Object {},
    "processedMDX": "/*@jsxRuntime automatic @jsxImportSource react*/
  import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
  function _createMdxContent(props) {
    const _components = Object.assign({
      h1: \\"h1\\",
      p: \\"p\\",
      strong: \\"strong\\"
    }, props.components);
    return _jsxs(_Fragment, {
      children: [_jsx(_components.h1, {
        children: \\"Hello\\"
      }), \\"/n\\", _jsxs(_components.p, {
        children: [\\"This is \\", _jsx(_components.strong, {
          children: \\"MDX\\"
        })]
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
`

const resolvesValidMdNotValidMdx = `
  Object {
    "metadata": Object {},
    "processedMDX": "/*@jsxRuntime automatic @jsxImportSource react*/
  import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from \\"react/jsx-runtime\\";
  function _createMdxContent(props) {
    const _components = Object.assign({
      h2: \\"h2\\",
      p: \\"p\\",
      br: \\"br\\",
      blockquote: \\"blockquote\\"
    }, props.components);
    return _jsxs(_Fragment, {
      children: [_jsx(_components.h2, {
        children: \\"This is a valid markdown file but NOT a valid mdx file\\"
      }), \\"/n\\", _jsxs(_components.p, {
        children: [\\"5 < 10\\", _jsx(_components.br, {}), \\"/n\\", \\"just an object: { pet: cat }\\"]
      }), \\"/n\\", _jsxs(_components.blockquote, {
        children: [\\"/n\\", _jsx(_components.p, {
          children: \\"cat above\\"
        }), \\"/n\\"]
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
`

const rejectsValidMdNotValidMdx = `
  Object {
    "context": Object {
      "absolutePath": "<PROJECT_ROOT>/packages/gatsby-plugin-mdx/src/__fixtures__/validMdNotValidMdx.md",
      "errorMeta": [4:22: Could not parse expression with acorn: Unexpected content after expression],
    },
    "id": "10001",
  }
`

interface ICaseObj {
  name: string
  options: CompileOptions
  expected: string
  shouldReject?: boolean
}

const mdxCases: Array<ICaseObj> = [
  { name: `default`, options: {}, expected: resolvesMdx },
  { name: `format: 'mdx'`, options: { format: `mdx` }, expected: resolvesMdx },
  {
    name: `format: 'md'`,
    options: { format: `md` },
    expected: resolvesMdxWithFormatMd,
  },
  {
    name: `format: 'detect'`,
    options: { format: `detect` },
    expected: resolvesMdx,
  },
]

const mdCases: Array<ICaseObj> = [
  {
    name: `format: 'md'`,
    options: { format: `md` },
    expected: resolvesValidMdNotValidMdx,
  },
  {
    name: `format: 'mdx'`,
    options: { format: `mdx` },
    expected: rejectsValidMdNotValidMdx,
    shouldReject: true,
  },
  {
    name: `format: 'detect'`,
    options: { format: `detect` },
    expected: resolvesValidMdNotValidMdx,
  },
]

it.each(mdxCases)(`compiles MDX ($name)`, async ({ options, expected }) => {
  await expect(
    compileMDX(
      { absolutePath: exampleMdxPath, source: exampleMdxContent.toString() },
      options,
      cache,
      reporter
    )
  ).resolves.toMatchInlineSnapshot(expected)
})

it.each(mdCases)(
  `compiles md ($name)`,
  async ({ options, expected, shouldReject }) => {
    const result = compileMDX(
      {
        absolutePath: validMdNotValidMdxPath,
        source: validMdNotValidMdxContent.toString(),
      },
      options,
      cache,
      reporter
    )

    const assertion = shouldReject
      ? expect(result).rejects
      : expect(result).resolves
    await assertion.toMatchInlineSnapshot(expected)
  }
)
