import test from 'ava'
import loadFrontmatter from '../../../lib/utils/build-page/load-frontmatter'

test('it works for string literal titles', (t) => {
  const pagePath =
    '../../fixtures/javascript-pages-frontmatter/pages/string-literal.js'
  const data = loadFrontmatter(pagePath)
  t.is(data.title, 'Foo')
})

test('it works for template literal titles', (t) => {
  const pagePath =
    '../../fixtures/javascript-pages-frontmatter/pages/template-literal.js'
  const data = loadFrontmatter(pagePath)
  t.is(data.title, 'Bar')
})

test('it works with array literal values', (t) => {
  const pagePath =
    '../../fixtures/javascript-pages-frontmatter/pages/array-literal.js'
  const data = loadFrontmatter(pagePath)
  t.is(data.titles[0], 'My title')
  t.is(data.titles[1], 'My other title')
})

test('it works with object literal values', (t) => {
  const pagePath =
    '../../fixtures/javascript-pages-frontmatter/pages/object-literal.js'
  const data = loadFrontmatter(pagePath)
  t.is(data.titles.main, 'My title')
  t.is(data.titles.sub, 'My other title')
})
