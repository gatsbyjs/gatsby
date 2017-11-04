import test from 'ava'
import path from 'path'
import Promise from 'bluebird'
import fse from 'fs-extra'
import { build } from '../support'

const fs = Promise.promisifyAll(fse)

const fixturePath = path.resolve('..', 'fixtures', 'site-with-chinese-path')

test.before('build the site', async () => {
  await build(fixturePath)
})

test('md file with chinese path is created', async (t) => {
  const mdFilePath = path.resolve(fixturePath, 'public', 'blog', '测试', 'index.html')
  const file = await fs.statAsync(mdFilePath)

  t.truthy(file)
})

test('jsx file with chinese path is created', async (t) => {
  const jsxFilePath = path.resolve(fixturePath, 'public', 'blog', '测试2', 'index.html')
  const file = await fs.statAsync(jsxFilePath)

  t.truthy(file)
})
