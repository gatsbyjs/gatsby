import { generateQueryFromString, reverseLookupParams } from "../extract-query"

describe(`extract query`, () => {
  describe(`root query string`, () => {
    it(`basic example`, () => {
      expect(generateQueryFromString(`Thing`, `/foo/bar/{id}.js`)).toBe(
        `{allThing{nodes{id}}}`
      )
    })

    it(`all example`, () => {
      expect(generateQueryFromString(`allThing`, `/foo/bar/{id}.js`)).toBe(
        `{allThing{nodes{id}}}`
      )
    })

    it(`all example with arguments`, () => {
      expect(
        generateQueryFromString(
          `allThing(filter: { main_url: { nin: [] }})`,
          `/foo/bar/{id}.js`
        )
      ).toBe(`{allThing(filter: { main_url: { nin: [] }}){nodes{id}}}`)
    })

    it(`supports a special fragment`, () => {
      expect(
        generateQueryFromString(
          `allMarkdownRemark {
        group(field: frontmatter___topic) {
            ...CollectionPagesQueryFragment
        }
    }`,
          `/foo/bar/{frontmatter__topic}.js`
        )
      ).toEqual(`allMarkdownRemark {
        group(field: frontmatter___topic) {
            nodes{frontmatter{topic}}
        }
    }`)
    })
  })

  describe(`filepath resolution`, () => {
    it(`basic example`, () => {
      expect(generateQueryFromString(`Thing`, `/foo/bar/{id}.js`)).toBe(
        `{allThing{nodes{id}}}`
      )
    })

    it(`multiple nodes`, () => {
      expect(generateQueryFromString(`Thing`, `/foo/bar/{id}/{name}.js`)).toBe(
        `{allThing{nodes{id,name}}}`
      )
    })

    it(`nested nodes`, () => {
      expect(
        generateQueryFromString(`Thing`, `/foo/bar/{id}/{fields__name}.js`)
      ).toBe(`{allThing{nodes{id,fields{name}}}}`)
    })

    it(`deeply nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          `/foo/bar/{id}/{fields__name__thing}.js`
        )
      ).toBe(`{allThing{nodes{id,fields{name{thing}}}}}`)
    })
  })
})

describe(`reverseLookupParams`, () => {
  it(`handles single depth items`, () => {
    expect(
      reverseLookupParams({ id: `foo`, otherProp: `bar` }, `/{id}.js`)
    ).toEqual({
      id: `foo`,
    })
  })

  it(`handles multiple depth items`, () => {
    expect(
      reverseLookupParams({ fields: { name: `foo` } }, `/{fields__name}.js`)
    ).toEqual({
      fields__name: `foo`,
    })
  })
})
