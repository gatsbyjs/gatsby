import test from 'ava'
import urlResolver from '../../../lib/utils/build-page/url-resolver'

test('returns undefined when filename starts with _', t => {
  const parsedPath = { name: '_notapage' }
  const data = {}
  const pagePath = urlResolver(data, parsedPath)
  t.true(pagePath === undefined)
})

test('uses the path from page data', t => {
  const parsedPath = { name: 'page', dirname: 'a-directory/' }
  const data = { path: '/page-at-root/' }
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/page-at-root/')
})

test('appends a trailing slash to path from page data', t => {
  const parsedPath = { name: 'page', dirname: 'a-directory/' }
  const data = { path: '/user-defined-path' }
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/user-defined-path/')
})

test('does not append trailing slash to .html paths from page data', t => {
  const parsedPath = { name: 'page', dirname: 'a-directory/' }
  const data = { path: '/user-defined-path.html' }
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/user-defined-path.html')
})

test('prepends a slash to all paths from page data', t => {
  const parsedPath = { name: 'page', dirname: 'a-directory/' }
  const data = { path: 'user-defined-path/' }
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/user-defined-path/')
})

test('removes index from path', t => {
  const parsedPath = { name: 'index', dirname: 'foo/bar' }
  const data = {}
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/foo/bar/')
})

test('removes template from path', t => {
  const parsedPath = { name: 'template', dirname: 'foo/bar' }
  const data = {}
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/foo/bar/')
})

test('template at root has root path', t => {
  const parsedPath = { name: 'template', dirname: '' }
  const data = {}
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/')
})

test('index at root has root path', t => {
  const parsedPath = { name: 'index', dirname: '' }
  const data = {}
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/')
})

test('if not an index create a path like /foo/bar/', t => {
  const parsedPath = { name: 'creating-static-websites', dirname: 'blog/2016' }
  const data = {}
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/blog/2016/creating-static-websites/')
})

test('if not an index create a path like /foo/bar/ from file at root', t => {
  const parsedPath = { name: 'about-us', dirname: '' }
  const data = {}
  const pagePath = urlResolver(data, parsedPath)
  t.is(pagePath, '/about-us/')
})
