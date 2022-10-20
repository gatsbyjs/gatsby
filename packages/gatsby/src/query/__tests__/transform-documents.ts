import * as graphql from "graphql"

import { tranformDocument } from "../transform-document"

function genSource(query: string): string {
  return `query { 
  ${query}
}`
}

function run(source: string): string {
  const query = genSource(source)
  const { ast, hasChanged, error } = tranformDocument(graphql.parse(query))
  if (error) {
    throw error
  }
  return hasChanged ? graphql.print(ast) : query
}

if (_CFLAGS_.GATSBY_MAJOR === `5`) {
  describe(`transformDocument`, () => {
    describe(`sort fields`, () => {
      describe(`transforms`, () => {
        it(`single field (root field), no order`, () => {
          expect(run(`allMarkdownRemark(sort: {fields: excerpt})`))
            .toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {excerpt: ASC})
            }"
          `)
        })

        it(`single field (nested field), no order`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: {fields: frontmatter___nested___date})`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {frontmatter: {nested: {date: ASC}}})
            }"
          `)
        })

        it(`single field, single order (ASC)`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: { 
            fields: frontmatter___date
            order: ASC
          })`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {frontmatter: {date: ASC}})
            }"
          `)
        })

        it(`single field, single order (DESC)`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: { 
            fields: frontmatter___date
            order: DESC
          })`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {frontmatter: {date: DESC}})
            }"
          `)
        })

        it(`list with single field, no order`, () => {
          expect(run(`allMarkdownRemark(sort: {fields: [frontmatter___date]})`))
            .toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {frontmatter: {date: ASC}})
            }"
          `)
        })

        it(`list with multiple fields, no order`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: {fields: [frontmatter___priority, frontmatter___date]})`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(
                sort: [{frontmatter: {priority: ASC}}, {frontmatter: {date: ASC}}]
              )
            }"
          `)
        })

        it(`single field, list with single order`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: { 
            fields: frontmatter___date
            order: [DESC]
          })`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {frontmatter: {date: DESC}})
            }"
          `)
        })

        it(`single field, list with multiple orders`, () => {
          // those extra orders are no-op, just testing that we process this also
          expect(
            run(
              `allMarkdownRemark(sort: { 
            fields: frontmatter___date
            order: [DESC, DESC, DESC]
          })`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {frontmatter: {date: DESC}})
            }"
          `)
        })

        it(`list with single field, list with single order`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: { 
            fields: [frontmatter___date]
            order: [DESC]
          })`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(sort: {frontmatter: {date: DESC}})
            }"
          `)
        })

        it(`list with multiple fields, list with single order`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: { 
            fields: [frontmatter___isFeatured, frontmatter___date]
            order: [DESC]
          })`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(
                sort: [{frontmatter: {isFeatured: DESC}}, {frontmatter: {date: ASC}}]
              )
            }"
          `)
        })

        it(`list with multiple fields, list with multiple orders`, () => {
          expect(
            run(
              `allMarkdownRemark(sort: { 
            fields: [frontmatter___isFeatured, frontmatter___date]
            order: [DESC, DESC]
          })`
            )
          ).toMatchInlineSnapshot(`
            "{
              allMarkdownRemark(
                sort: [{frontmatter: {isFeatured: DESC}}, {frontmatter: {date: DESC}}]
              )
            }"
          `)
        })
      })

      describe(`ignores`, () => {
        it(`unknown field`, () => {
          const input = `allMarkdownRemark(sort: { 
                         fields: frontmatter___isFeatured
                         unknown: 5
                       })`
          expect(run(input)).toEqual(genSource(input))
        })

        it(`array`, () => {
          const input = `allMarkdownRemark(sort: [false])`
          expect(run(input)).toEqual(genSource(input))
        })

        it(`scalar`, () => {
          const input = `allMarkdownRemark(sort: "test")`
          expect(run(input)).toEqual(genSource(input))
        })

        it(`new API (transform is idempotent)`, () => {
          const input = `allMarkdownRemark(sort: { frontmatter: { date: DESC }})`
          expect(run(input)).toEqual(genSource(input))
        })

        it(`new API (transform is idempotent with "fields" edge case)`, () => {
          const input = `allMarkdownRemark(sort: { fields: { slug: ASC }})`
          expect(run(input)).toEqual(genSource(input))
        })
      })
    })

    describe(`aggr fields`, () => {
      describe(`transforms`, () => {
        it(`root field`, () => {
          expect(run(`distinct(field: frontmatter___category)`))
            .toMatchInlineSnapshot(`
            "{
              distinct(field: {frontmatter: {category: SELECT}})
            }"
          `)
        })

        it(`nested field`, () => {
          expect(run(`distinct(field: frontmatter___nested_category)`))
            .toMatchInlineSnapshot(`
            "{
              distinct(field: {frontmatter: {nested_category: SELECT}})
            }"
          `)
        })
      })
      describe(`ignores`, () => {
        it(`object`, () => {
          const input = `distinct(field: { test: true })`
          expect(run(input)).toEqual(genSource(input))
        })

        it(`array`, () => {
          const input = `distinct(field: [false])`
          expect(run(input)).toEqual(genSource(input))
        })

        it(`scalar`, () => {
          const input = `distinct(sort: "test")`
          expect(run(input)).toEqual(genSource(input))
        })

        it(`new API (transform is idempotent)`, () => {
          const input = `distinct(field: { frontmatter: { date: SELECT }})`
          expect(run(input)).toEqual(genSource(input))
        })
      })
    })
  })
} else {
  it(`no-op in v4`, () => {
    expect(run(`allMarkdownRemark(sort: {fields: excerpt})`))
      .toMatchInlineSnapshot(`
          "query { 
            allMarkdownRemark(sort: {fields: excerpt})
          }"
        `)
  })
}
