import { generateQueryFromString, reverseLookupParams } from "../extract-query"
import path from "path"

// windows and mac have different separators, all code is written with unix-like
// file systems, but the underlying code uses `path.sep`. So when running tests
// on windows, they would fail without us swapping the separators.
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
      ).toBe(`{allThing{nodes{id}}}`)
    })

    it(`handles lowercased model name`, () => {
      expect(
        generateQueryFromString(
          `contentfulType`,
          compatiblePath(`/foo/{contentfulType.id}.js`)
        )
      ).toBe(`{allContentfulType{nodes{id}}}`)
    })

    it(`handles model name with underscore`, () => {
      expect(
        generateQueryFromString(
          `_customType`,
          compatiblePath(`/foo/{_customType.id}.js`)
        )
      ).toBe(`{allCustomType{nodes{id}}}`)
    })

    it(`handles model name with number`, () => {
      expect(
        generateQueryFromString(
          `Type123`,
          compatiblePath(`/foo/{Type123.id}.js`)
        )
      ).toBe(`{allType123{nodes{id}}}`)
    })

    it(`handles fields with number or underscore`, () => {
      expect(
        generateQueryFromString(
          `_type123`,
          compatiblePath(`/foo/{_type123.field123}.js`)
        )
      ).toBe(`{allType123{nodes{field123,id}}}`)
      expect(
        generateQueryFromString(
          `_type123`,
          compatiblePath(`/foo/{_type123._field123}.js`)
        )
      ).toBe(`{allType123{nodes{_field123,id}}}`)
    })

    it(`works with different file extensions`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}.tsx`)
        )
      ).toBe(`{allThing{nodes{id}}}`)
    })
  })

  describe(`filepath resolution`, () => {
    it(`basic example`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}.js`)
        )
      ).toBe(`{allThing{nodes{id}}}`)
    })

    it(`always queries id`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.baz}.js`)
        )
      ).toBe(`{allThing{nodes{baz,id}}}`)
    })

    it(`multiple nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.name}.js`)
        )
      ).toBe(`{allThing{nodes{id,name}}}`)
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}-{Thing.name}.js`)
        )
      ).toBe(`{allThing{nodes{id,name}}}`)
    })

    it(`nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.fields__name}.js`)
        )
      ).toBe(`{allThing{nodes{id,fields{name}}}}`)
    })

    it(`multiple nested nodes`, () => {
      expect(
        generateQueryFromString(
          `thing`,
          compatiblePath(
            `/foo/bar/{thing.fields__name}/{thing.fields__description}.js`
          )
        )
      ).toBe(`{allThing{nodes{fields{name},fields{description},id}}}`)
    })

    it(`deeply nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.fields__name__thing}.js`)
        )
      ).toBe(`{allThing{nodes{id,fields{name{thing}}}}}`)
      expect(
        generateQueryFromString(
          `customType`,
          compatiblePath(
            `/foo/bar/{customType.id}/{customType.fields__name__thing}.js`
          )
        )
      ).toBe(`{allCustomType{nodes{id,fields{name{thing}}}}}`)
    })

    it(`deeply nested nodes with prefixes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(
            `/foo/bar/prefix-{Thing.id}/another-prefix_{Thing.fields__name__thing}.js`
          )
        )
      ).toBe(`{allThing{nodes{id,fields{name{thing}}}}}`)
    })

    it(`deeply nested nodes with postfixes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(
            `/foo/bar/{Thing.id}-postfix/{Thing.fields__name__thing}_another-postfix.js`
          )
        )
      ).toBe(`{allThing{nodes{id,fields{name{thing}}}}}`)
    })

    it(`supports graphql unions`, () => {
      expect(
        generateQueryFromString(
          `UnionQuery`,
          compatiblePath(
            `/foo/bar/{UnionQuery.id}/{UnionQuery.parent__(File)__relativePath}.js`
          )
        )
      ).toBe(`{allUnionQuery{nodes{id,parent{... on File{relativePath}}}}}`)
    })

    it(`supports nested graphql unions`, () => {
      expect(
        generateQueryFromString(
          `UnionQuery`,
          compatiblePath(
            `/foo/bar/{UnionQuery.id}/{UnionQuery.parent__(File)__parent__(Bar)__relativePath}.js`
          )
        )
      ).toBe(
        `{allUnionQuery{nodes{id,parent{... on File{parent{... on Bar{relativePath}}}}}}}`
      )
    })
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
