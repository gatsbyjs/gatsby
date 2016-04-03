import test from 'ava'
import pathResolver from '../../lib/utils/path-resolver'

test('returns undefined when filename starts with _', t => {
  const parsedPath = { name: '_notapage' }
  const data = {}
  const pagePath = pathResolver(data, parsedPath)
  t.true(pagePath === undefined)
})

test('uses the path from page data', t => {
  const parsedPath = { name: 'page', dirname: 'a-directory/' }
  const data = { path: '/page-at-root' }
  const pagePath = pathResolver(data, parsedPath)
  t.same(pagePath, '/page-at-root')
})

test('removes index from path', t => {
  const parsedPath = { name: 'index', dirname: 'foo/bar' }
  const data = {}
  const pagePath = pathResolver(data, parsedPath)
  t.same(pagePath, '/foo/bar/')
})

test('removes template from path', t => {
  const parsedPath = { name: 'template', dirname: 'foo/bar' }
  const data = {}
  const pagePath = pathResolver(data, parsedPath)
  t.same(pagePath, '/foo/bar/')
})

test('template at root has root path', t => {
  const parsedPath = { name: 'template', dirname: '' }
  const data = {}
  const pagePath = pathResolver(data, parsedPath)
  t.same(pagePath, '/')
})

test('index at root has root path', t => {
  const parsedPath = { name: 'index', dirname: '' }
  const data = {}
  const pagePath = pathResolver(data, parsedPath)
  t.same(pagePath, '/')
})

test('if not an index create a path like /foo/bar/', t => {
  const parsedPath = { name: 'creating-static-websites', dirname: 'blog/2016' }
  const data = {}
  const pagePath = pathResolver(data, parsedPath)
  t.same(pagePath, '/blog/2016/creating-static-websites/')
})

test('if not an index create a path like /foo/bar/', t => {
  const parsedPath = { name: 'about-us', dirname: '' }
  const data = {}
  const pagePath = pathResolver(data, parsedPath)
  t.same(pagePath, '/about-us/')
})
