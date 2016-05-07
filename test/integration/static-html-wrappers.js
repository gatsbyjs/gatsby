import test from 'ava'
import path from 'path'
import { build, dom } from '../helpers'

const fixturePath = path.resolve('..', 'fixtures', 'static-wrappers')

test.before('build the site ', async () => {
  await build(fixturePath)
})

test('html/index.html has an h1 that states file extention', async t => {
  const filePath = path.join(fixturePath, 'public', 'html', 'index.html')
  const $ = await dom(filePath)

  const heading = $('h1')
  t.truthy(heading)
  const headingText = heading.text()
  t.is(headingText, 'html')
})

test('md/index.html has an h1 that states file extention', async t => {
  const filePath = path.join(fixturePath, 'public', 'md', 'index.html')
  const $ = await dom(filePath)

  const heading = $('h1').last()
  t.truthy(heading)
  const headingText = heading.text()
  t.is(headingText, 'md')
})
