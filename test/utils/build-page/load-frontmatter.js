import loadFrontmatter from '../../../lib/utils/build-page/load-frontmatter'
import test from 'ava'

test('it works for string literal titles', (t) => {
  const pagePath = '../../fixtures/template-literal-frontmatter/pages/string-literal.js'
  const data = loadFrontmatter(pagePath)
  t.is(data.title, 'Foo')
})

test('it works for template literal titles', (t) => {
  const pagePath = '../../fixtures/template-literal-frontmatter/pages/template-literal.js'
  const data = loadFrontmatter(pagePath)
  t.is(data.title, 'Bar')
})
