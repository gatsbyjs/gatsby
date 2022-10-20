import { applyTransform } from "jscodeshift/dist/testUtils"
import { join } from "path"

import transform from "../sort-and-aggr-graphql"

const transformName = `sort-and-aggr-graphql`

function genSource(query: string): string {
  return `import { graphql } from "gatsby"

export const q = graphql\`
  query {
${query
  .split(`\n`)
  .map(line => `    ${line}`)
  .join(`\n`)}
  }
\``
}

function run(source: string): string {
  return applyTransform(transform, null, {
    source: genSource(source),
    path: join(__dirname, `..`, `..`, `example.js`),
  })
}

describe(transformName, () => {
  describe(`sort fields`, () => {
    describe(`transforms`, () => {
      it(`single field (root field), no order`, () => {
        expect(run(`allMarkdownRemark(sort: {fields: excerpt})`))
          .toMatchInlineSnapshot(`
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {excerpt: ASC})
          }\`"
        `)
      })

      it(`single field (nested field), no order`, () => {
        expect(
          run(`allMarkdownRemark(sort: {fields: frontmatter___nested___date})`)
        ).toMatchInlineSnapshot(`
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {frontmatter: {nested: {date: ASC}}})
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {frontmatter: {date: ASC}})
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {frontmatter: {date: DESC}})
          }\`"
        `)
      })

      it(`list with single field, no order`, () => {
        expect(run(`allMarkdownRemark(sort: {fields: [frontmatter___date]})`))
          .toMatchInlineSnapshot(`
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {frontmatter: {date: ASC}})
          }\`"
        `)
      })

      it(`list with multiple fields, no order`, () => {
        expect(
          run(
            `allMarkdownRemark(sort: {fields: [frontmatter___priority, frontmatter___date]})`
          )
        ).toMatchInlineSnapshot(`
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(
              sort: [{frontmatter: {priority: ASC}}, {frontmatter: {date: ASC}}]
            )
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {frontmatter: {date: DESC}})
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {frontmatter: {date: DESC}})
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(sort: {frontmatter: {date: DESC}})
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(
              sort: [{frontmatter: {isFeatured: DESC}}, {frontmatter: {date: ASC}}]
            )
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            allMarkdownRemark(
              sort: [{frontmatter: {isFeatured: DESC}}, {frontmatter: {date: DESC}}]
            )
          }\`"
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
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            distinct(field: {frontmatter: {category: SELECT}})
          }\`"
        `)
      })

      it(`nested field`, () => {
        expect(run(`distinct(field: frontmatter___nested_category)`))
          .toMatchInlineSnapshot(`
          "import { graphql } from \\"gatsby\\"

          export const q = graphql\`{
            distinct(field: {frontmatter: {nested_category: SELECT}})
          }\`"
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

  describe(`CallExpression`, () => {
    it(`graphql(\`...\`)`, () => {
      expect(
        applyTransform(transform, null, {
          source: `
        exports.createPages = ({ graphql, actions }) => {
          const { data } = graphql(\`
            {
              allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {
                nodes {
                  id
                }
              }
            }
          \`)
        }
        `,
          path: join(__dirname, `..`, `..`, `example.js`),
        })
      ).toMatchInlineSnapshot(`
        "exports.createPages = ({ graphql, actions }) => {
                  const { data } = graphql(\`{
          allMarkdownRemark(sort: {frontmatter: {date: DESC}}) {
            nodes {
              id
            }
          }
        }\`)
                }"
      `)
    })

    it(`graphql("...")`, () => {
      expect(
        applyTransform(transform, null, {
          source: `
        exports.createPages = ({ graphql, actions }) => {
          const { data } = graphql("{ allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {  nodes { id } } }")
        }
        `,
          path: join(__dirname, `..`, `..`, `example.js`),
        })
      ).toMatchInlineSnapshot(`
        "exports.createPages = ({ graphql, actions }) => {
                  const { data } = graphql(\`{
          allMarkdownRemark(sort: {frontmatter: {date: DESC}}) {
            nodes {
              id
            }
          }
        }\`)
                }"
      `)
    })

    it(`graphql('...')`, () => {
      expect(
        applyTransform(transform, null, {
          source: `
        exports.createPages = ({ graphql, actions }) => {
          const { data } = graphql("{ allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {  nodes { id } } }")
        }
        `,
          path: join(__dirname, `..`, `..`, `example.js`),
        })
      ).toMatchInlineSnapshot(`
        "exports.createPages = ({ graphql, actions }) => {
                  const { data } = graphql(\`{
          allMarkdownRemark(sort: {frontmatter: {date: DESC}}) {
            nodes {
              id
            }
          }
        }\`)
                }"
      `)
    })
  })
})
