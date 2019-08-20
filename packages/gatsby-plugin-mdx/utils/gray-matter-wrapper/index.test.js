const grayMatterWrapper = require(`.`)
const c = require(`js-combinatorics`)

const generateExcerptFixture = params => {
  const { frontmatter, excerpt, excerpt_separator } = params
  const code = {
    frontmatter: `---
one: two
excerpt: This is excerpt from frontmatter.
---`,
    excerpt: `This is an excerpt.
This is also an excerpt.`,
    excerptSeparator: `<!--more-->`,
    body: `This could be an excerpt.
---
This is content.`,
  }
  return {
    name:
      Object.entries(params)
        .filter(([_, v]) => !!v)
        .map(([k, _]) => k)
        .join(`-`) || `body`,
    input: [
      frontmatter ? code.frontmatter : ``,
      code.excerpt,
      excerpt_separator ? code.excerptSeparator : ``,
      code.body,
    ].join(`\n`),
    options: {
      grayMatter: {
        excerpt: excerpt,
        excerpt_separator: excerpt_separator
          ? code.excerptSeparator
          : undefined,
      },
    },
  }
}

const excerptFixtures = c
  .baseN([true, false], 3)
  .toArray()
  .map(([frontmatter, excerpt, excerpt_separator]) => {
    const { name, input, options } = generateExcerptFixture({
      frontmatter,
      excerpt,
      excerpt_separator,
    })
    return [name, input, options]
  })

describe(`gray-matter`, () => {
  describe(`excerpt`, () => {
    test.each(excerptFixtures)(`snapshot with %s`, (name, input, options) => {
      const matter = grayMatterWrapper(input, options)
      expect(matter).toMatchSnapshot()
    })
  })
})
