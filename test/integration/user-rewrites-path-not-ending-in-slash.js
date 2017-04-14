import test from 'ava'
import path from 'path'
import Promise from 'bluebird'
import fse from 'fs-extra'
import { build } from '../support'

const fs = Promise.promisifyAll(fse)

const fixturePath = path.resolve('..', 'fixtures', 'path-not-ending-in-slash')

// eslint-disable-next-line
test.before('build the site', async () => {
  await build(fixturePath)
})

// eslint-disable-next-line
test('the index page has been moved to the hardcoded path', async t => {
  const indexPath = path.resolve(
    fixturePath,
    'public',
    'hello-world',
    'index.html'
  )
  const file = await fs.statAsync(indexPath)

  t.truthy(file)
})

// eslint-disable-next-line
test("the image has been moved to match the moved page's path", async t => {
  const imagePath = path.resolve(
    fixturePath,
    'public',
    'hello-world',
    'image.jpg'
  )
  const file = await fs.statAsync(imagePath)

  t.truthy(file)
})
