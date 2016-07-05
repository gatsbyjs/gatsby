import test from 'ava'
import path from 'path'
import _ from 'lodash'
import pathResolver from '../../../lib/utils/build-page/path-resolver'

test('it returns an object', t => {
  const pagePath = '/'
  const result = pathResolver(pagePath)
  t.truthy(result)
  t.is(typeof result, 'object')
})

test('it has a require path', t => {
  const pagePath = '/a-blog-post/index.md'
  const result = pathResolver(pagePath)
  t.truthy(result.requirePath)
  t.is(typeof result.requirePath, 'string')
})

test('it does not has a path if the name start with _', t => {
  t.is(pathResolver('/_metadata.js').path, undefined)
  t.is(pathResolver('/_template.html.erb').path, undefined)
  t.is(pathResolver('/_notapage.json').path, undefined)
})

test('it has a path if the name doesnt start with _', t => {
  t.truthy(pathResolver('/2015/back-to-the-future.md').path)
  t.truthy(pathResolver('/my-first-blog.md').path)
  t.truthy(pathResolver('/index.md').path)
})

test('it has a templatePath if the name is _template', t => {
  const pagePath = '/_template.js'
  const result = pathResolver(pagePath)
  t.truthy(result.templatePath)
  t.is(typeof result.templatePath, 'string')
})

test('it does not have a templatePath if not a _template', t => {
  t.is(pathResolver('/index.md').templatePath, undefined)
  t.is(pathResolver('/another-page.toml').templatePath, undefined)
  t.is(pathResolver('/something-else/good-stuff.html').templatePath, undefined)
})

test('the directory name has / slashes', t => {
  const pagePath = '/2016/testing-middleman-sites-with-capybara/index.md'
  const result = pathResolver(pagePath)

  t.is(result.file.dirname, path.posix.normalize(result.file.dirname))
  t.is(result.file.dirname, '/2016/testing-middleman-sites-with-capybara')
})

test('the ext doesnt have a leading .', t => {
  const result = pathResolver('/index.md')
  t.false(_.startsWith(result.file.ext, '.'))
})
