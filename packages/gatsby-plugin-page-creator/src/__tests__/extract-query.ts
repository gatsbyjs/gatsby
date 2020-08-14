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
      ).toBe(`{allThing{nodes{id}}}`)
    })

    it(`works with different file extsnions`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}.tsx`)
        )
      ).toBe(`{allThing{nodes{id}}}`)
    })

    it(`works with arguments arguments`, () => {
      expect(
        generateQueryFromString(
          `{ allThing(filter: { main_url: { nin: [] }}) { ...CollectionPagesQueryFragment } }`,
          compatiblePath(`/foo/bar/{Thing.id}.js`)
        )
      ).toBe(`{ allThing(filter: { main_url: { nin: [] }}) { nodes{id} } }`)
    })

    it(`supports a special fragment`, () => {
      expect(
        generateQueryFromString(
          `{ allMarkdownRemark {
        group(field: frontmatter___topic) {
            ...CollectionPagesQueryFragment
        }}
    }`,
          compatiblePath(`/foo/bar/{MarkdownRemark.frontmatter__topic}.js`)
        )
      ).toEqual(`{ allMarkdownRemark {
        group(field: frontmatter___topic) {
            nodes{frontmatter{topic},id}
        }}
    }`)
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
    })

    it(`nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.fields__name}.js`)
        )
      ).toBe(`{allThing{nodes{id,fields{name}}}}`)
    })

    it(`deeply nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{Thing.id}/{Thing.fields__name__thing}.js`)
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
  })

  it(`handles multiple depth items`, () => {
    expect(
      reverseLookupParams(
        { fields: { name: `foo` } },
        compatiblePath(`/{Model.fields__name}.js`)
      )
    ).toEqual({
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
      parent__relativePath: `foo`,
    })
  })
})
