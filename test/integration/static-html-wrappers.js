import test from 'ava'
import path from 'path'
import Promise from 'bluebird'
import fsExtra from 'fs-extra'
import { exec, dom } from '../support'
const fs = Promise.promisifyAll(fsExtra)

const starterPath = path.resolve('../', 'fixtures', 'starter-wrappers')
const buildPath = path.join(starterPath, 'public')
const gatsby = path.resolve('../../bin', 'gatsby.js')

test.serial('can build the starter', async t => {
  await fs.remove(buildPath)

  const exitCode = await exec(gatsby, ['build'], { cwd: starterPath })
  const bundle = await fs.statAsync(path.join(buildPath, 'bundle.js'))

  t.is(exitCode, 0)
  t.truthy(bundle)
})

test('html/index.html has an h1 that states file extention', async t => {
  const $ = await dom(path.join(buildPath, 'html/index.html'))

  const heading = $('h1')
  t.truthy(heading)
  const headingText = heading.text()
  t.is(headingText, 'html')
})

test('md/index.html has an h1 that states file extention', async t => {
  const $ = await dom(path.join(buildPath, 'md/index.html'))

  // MD wrapper spits out an h1 tag. Shouldn't it be consistent with HTML
  const heading = $('h1').last()
  t.truthy(heading)
  const headingText = heading.text()
  t.is(headingText, 'md')
})
