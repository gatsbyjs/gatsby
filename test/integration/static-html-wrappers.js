import test from 'ava'
import path from 'path'
import { build, dom } from '../support'

const fixturePath = path.resolve('..', 'fixtures', 'static-wrappers')

// eslint-disable-next-line
test.before('build the site ', async () => {
  await build(fixturePath)
})

// eslint-disable-next-line
test('html/index.html has an h1 that states file extention', async t => {
  const filePath = path.join(fixturePath, 'public', 'html', 'index.html')
  const $ = await dom(filePath)

  const heading = $('h1')
  t.truthy(heading)
  const headingText = heading.text()
  t.is(headingText, 'html')
})

// eslint-disable-next-line
test('md/index.html has an h1 that states file extention', async t => {
  const filePath = path.join(fixturePath, 'public', 'md', 'index.html')
  const $ = await dom(filePath)

  const heading = $('h1').last()
  t.truthy(heading)
  const headingText = heading.text()
  t.is(headingText, 'md')
})
