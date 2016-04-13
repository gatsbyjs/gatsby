import test from 'ava'
import path from 'path'
import Promise from 'bluebird'
import { spawn } from '../support'
import fse from 'fs-extra'
const fs = Promise.promisifyAll(fse)

const fixturePath = path.resolve('../fixtures/path-rewrite')
const buildPath = path.resolve(fixturePath, 'public')
const gatsby = path.resolve('../../bin', 'gatsby.js')

test.before('build the site', async () => {
  await fs.remove(buildPath)
  await spawn(gatsby, ['build'], { cwd: fixturePath })
})

test('the move-me file has been moved', async t => {
  const movedPath = path.resolve(buildPath, 'moved', 'index.html')
  const file = await fs.statAsync(movedPath)

  t.truthy(file)
})

test('the dont-move-me file has not been moved', async t => {
  const dontMovePath = path.resolve(buildPath, 'dont-move-me', 'index.html')
  const file = await fs.statAsync(dontMovePath)

  t.truthy(file)
})
