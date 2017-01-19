import test from 'ava'
import path from 'path'
import Promise from 'bluebird'
import fse from 'fs-extra'
import { build } from '../support'

const fs = Promise.promisifyAll(fse)

const fixturePath = path.resolve('..', 'fixtures', 'path-rewrite')

// eslint-disable-next-line
test.before('build the site', async () => {
  await build(fixturePath)
})

// eslint-disable-next-line
test('the move-me file has been moved', async (t) => {
  const movedPath = path.resolve(fixturePath, 'public', 'moved', 'index.html')
  const file = await fs.statAsync(movedPath)

  t.truthy(file)
})

// eslint-disable-next-line
test('the dont-move-me file has not been moved', async (t) => {
  const dontMovePath = path.resolve(fixturePath, 'public', 'dont-move-me', 'index.html')
  const file = await fs.statAsync(dontMovePath)

  t.truthy(file)
})
