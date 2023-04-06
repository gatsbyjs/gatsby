import { findCollectionPageFiles } from "../path-utils"
import path from "path"

describe(`findCollectionPageFiles`, () => {
  it(`will find all and only the collection routes in a fixture`, async () => {
    expect(
      await findCollectionPageFiles(
        path.join(__dirname, `fixtures`, `page-utils`, `collection-routes`)
      )
    ).toMatchInlineSnapshot(`
      Array [
        "{Other.extension}.js",
        "{RootItem.name}.tsx",
        "nested/{NestedItem.name}.tsx",
        "nested/{NestedDirectoryOnlyItem}/edit.tsx",
        "nested/{NestedDirectoryOnlyItem}/index.tsx",
      ]
    `)
  })
})
