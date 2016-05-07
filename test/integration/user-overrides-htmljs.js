import test from 'ava'
import path from 'path'
import includes from 'lodash/includes'
import { build, develop, dom } from '../helpers'

const fixturePath = path.resolve('..', 'fixtures', 'override-htmljs')

test.before('build the site', async () => {
  await build(fixturePath)
})

test('the rendered index has the override footer', async t => {
  const indexPath = path.resolve(fixturePath, 'public', 'index.html')
  const $ = await dom(indexPath)

  const footer = $('footer').first()
  t.truthy(footer)
  const footerText = footer.text()
  t.true(includes(footerText, 'html.js'))
})

test('the server has the override footer', async t => {
  const server = await develop(fixturePath)
  const $ = await server.getHtml('/')

  const footer = $('footer').first()
  t.truthy(footer)
  const footerText = footer.text()
  t.true(includes(footerText, 'html.js'))
})
