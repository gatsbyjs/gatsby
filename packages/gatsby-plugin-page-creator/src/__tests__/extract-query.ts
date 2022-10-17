import { generateQueryFromString, reverseLookupParams } from "../extract-query"
import path from "path"

// windows and mac have different seperators, all code is written with unix-like
// file systems, but the underlying code uses `path.sep`. So when running tests
// on windows, they would fail without us swapping the seperators.
const compatiblePath = (filepath: string): string =>
  filepath.replace(/\//g, path.sep)

describe(`extract query`, () => {
  describe(`root query string`, () => {
    it(`basic example`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,internal{contentFilePath}}}}"`
      )
    })

    it(`handles lowercased model name`, () => {
      expect(
        generateQueryFromString(
          `contentfulType`,
          compatiblePath(`/foo/{contentfulType.id}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allContentfulType{nodes{id,internal{contentFilePath}}}}"`
      )
    })

    it(`handles model name with underscore`, () => {
      expect(
        generateQueryFromString(
          `_customType`,
          compatiblePath(`/foo/{_customType.id}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allCustomType{nodes{id,internal{contentFilePath}}}}"`
      )
    })

    it(`handles model name with number`, () => {
      expect(
        generateQueryFromString(
          `Type123`,
          compatiblePath(`/foo/{Type123.id}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allType123{nodes{id,internal{contentFilePath}}}}"`
      )
    })

    it(`handles fields with number or underscore`, () => {
      expect(
        generateQueryFromString(
          `_type123`,
          compatiblePath(`/foo/{_type123.field123}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allType123{nodes{field123,id,internal{contentFilePath}}}}"`
      )
      expect(
        generateQueryFromString(
          `_type123`,
          compatiblePath(`/foo/{_type123._field123}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allType123{nodes{_field123,id,internal{contentFilePath}}}}"`
      )
    })

    it(`works with different file extensions`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}.tsx`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,internal{contentFilePath}}}}"`
      )
    })
  })

  describe(`filepath resolution`, () => {
    it(`basic example`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,internal{contentFilePath}}}}"`
      )
    })

    it(`always queries id`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.baz}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{baz,id,internal{contentFilePath}}}}"`
      )
    })

    it(`multiple nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.name}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,name,internal{contentFilePath}}}}"`
      )
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}-{Thing.name}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,name,internal{contentFilePath}}}}"`
      )
    })

    it(`nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.fields__name}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,fields{name},internal{contentFilePath}}}}"`
      )
    })

    it(`multiple nested nodes`, () => {
      expect(
        generateQueryFromString(
          `thing`,
          compatiblePath(
            `/foo/bar/{thing.fields__name}/{thing.fields__description}.js`
          )
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{fields{name},fields{description},id,internal{contentFilePath}}}}"`
      )
    })

    it(`deeply nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.fields__name__thing}.js`)
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,fields{name{thing}},internal{contentFilePath}}}}"`
      )
      expect(
        generateQueryFromString(
          `customType`,
          compatiblePath(
            `/foo/bar/{customType.id}/{customType.fields__name__thing}.js`
          )
        )
      ).toMatchInlineSnapshot(
        `"{allCustomType{nodes{id,fields{name{thing}},internal{contentFilePath}}}}"`
      )
    })

    it(`deeply nested nodes with prefixes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(
            `/foo/bar/prefix-{Thing.id}/another-prefix_{Thing.fields__name__thing}.js`
          )
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,fields{name{thing}},internal{contentFilePath}}}}"`
      )
    })

    it(`deeply nested nodes with postfixes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(
            `/foo/bar/{Thing.id}-postfix/{Thing.fields__name__thing}_another-postfix.js`
          )
        )
      ).toMatchInlineSnapshot(
        `"{allThing{nodes{id,fields{name{thing}},internal{contentFilePath}}}}"`
      )
    })

    it(`supports graphql unions`, () => {
      expect(
        generateQueryFromString(
          `UnionQuery`,
          compatiblePath(
            `/foo/bar/{UnionQuery.id}/{UnionQuery.parent__(File)__relativePath}.js`
          )
        )
      ).toMatchInlineSnapshot(
        `"{allUnionQuery{nodes{id,parent{... on File{relativePath}},internal{contentFilePath}}}}"`
      )
    })

    it(`supports nested graphql unions`, () => {
      expect(
        generateQueryFromString(
          `UnionQuery`,
          compatiblePath(
            `/foo/bar/{UnionQuery.id}/{UnionQuery.parent__(File)__parent__(Bar)__relativePath}.js`
          )
        )
      ).toMatchInlineSnapshot(
        `"{allUnionQuery{nodes{id,parent{... on File{parent{... on Bar{relativePath}}}},internal{contentFilePath}}}}"`
      )
    })
  })

  it(`supports limiting collection query to specified node ids if provided`, () => {
    expect(
      generateQueryFromString(
        `Thing`,
        compatiblePath(`/foo/bar/{Thing.id}/{Thing.fields__name}.js`),
        [`id-1`, `id-2`]
      )
    ).toMatchInlineSnapshot(
      `"{allThing(filter: { id: { in: [\\"id-1\\",\\"id-2\\"] } }){nodes{id,fields{name},internal{contentFilePath}}}}"`
    )
  })
})

describe(`reverseLookupParams`, () => {
  it(`handles single depth items`, () => {
    expect(
      reverseLookupParams(
        { id: `foo`, otherProp: `bar` },
        compatiblePath(`/{Model.id}.js`)
      )
    ).toEqual({
      id: `foo`,
    })
    expect(
      reverseLookupParams(
        { id: `foo`, otherProp: `bar` },
        compatiblePath(`/{model.id}.js`)
      )
    ).toEqual({
      id: `foo`,
    })
  })

  it(`handles multiple depth items`, () => {
    expect(
      reverseLookupParams(
        { fields: { name: `foo` } },
        compatiblePath(`/{Model.fields__name}.js`)
      )
    ).toEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      fields__name: `foo`,
    })
    expect(
      reverseLookupParams(
        { fields: { name: `foo` } },
        compatiblePath(`/{_model.fields__name}.js`)
      )
    ).toEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      fields__name: `foo`,
    })
  })

  it(`handles graphql unions`, () => {
    expect(
      reverseLookupParams(
        // Unions are not present in the resulting structure
        { parent: { relativePath: `foo` } },
        compatiblePath(`/{Model.parent__(File)__relativePath}.js`)
      )
    ).toEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      parent__relativePath: `foo`,
    })
    expect(
      reverseLookupParams(
        // Unions are not present in the resulting structure
        { parent: { relativePath: `foo` } },
        compatiblePath(`/{model123.parent__(File)__relativePath}.js`)
      )
    ).toEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      parent__relativePath: `foo`,
    })
  })
})
