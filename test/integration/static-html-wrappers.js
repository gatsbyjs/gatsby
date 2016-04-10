import test from 'ava'
import path from 'path'
import Promise from 'bluebird'
import fsExtra from 'fs-extra'
import { exec, jsdom } from '../support'
const fs = Promise.promisifyAll(fsExtra)

const starterPath = path.resolve('../', 'fixtures', 'starter-wrappers')
const buildPath = path.join(starterPath, 'public')

test.serial('can build the starter', async t => {
  await fs.remove(buildPath)

  const exitCode = await exec('gatsby', ['build'], { cwd: starterPath })
  const bundle = await fs.statAsync(path.join(buildPath, 'bundle.js'))

  t.is(exitCode, 0)
  t.truthy(bundle)
})

test('html/index.html has an h1 that states file extention', async t => {
  const { document } = await jsdom(path.join(buildPath, 'html/index.html'))
  t.truthy(document)

  const heading = document.querySelector('h1')
  t.truthy(heading)

  const headingText = heading.textContent
  t.is(headingText, 'html')
})

test('md/index.html has an h1 that states file extention', async t => {
  const { document } = await jsdom(path.join(buildPath, 'md/index.html'))
  t.truthy(document)

  // MD wrapper spits out an h1 tag. Shouldn't it be consistent with HTML
  const heading = document.querySelectorAll('h1')[1]
  t.truthy(heading)

  const headingText = heading.textContent
  t.is(headingText, 'md')
})
