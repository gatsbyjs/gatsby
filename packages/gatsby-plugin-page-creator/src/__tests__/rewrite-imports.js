import { rewriteImports } from "../rewrite-imports"

const root = `/Users/user/gatsby-site`

function buildImport(path) {
  return {
    node: {
      source: {
        value: path,
      },
    },
  }
}

describe(`rewrite-imports`, () => {
  it(`supports app pages`, () => {
    const relativeImport = buildImport(`../../components/product.js`)
    const absolutePath = `/Users/user/gatsby-site/src/pages/products/[id].js`

    rewriteImports(root, absolutePath, relativeImport)

    expect(relativeImport.node.source.value).toBe(
      `../../src/blainekasten/components/product.js`
    )
  })

  it(`supports themes from node_modules`, () => {
    const relativeImport = buildImport(`../../components/product.js`)
    const absolutePath = `/Users/user/gatsby-site/node_modules/gatsby-theme-blog/src/pages/products/[id].js`

    rewriteImports(root, absolutePath, relativeImport)

    expect(relativeImport.node.source.value).toBe(
      `../../node_modules/gatsby-theme-blog/src/blainekasten/components/product.js`
    )
  })
})
