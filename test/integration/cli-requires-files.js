import test from 'ava'
import path from 'path'
import { gatsbyCmd } from '../support'

// Fixture of a folder without any required files
const fixturePath = path.resolve(`..`, `fixtures`, `site-with-valid-babelrc`)

test(`gatsby new on an directory without required files does not exit `, async t => {
  const result = await t.notThrows(gatsbyCmd(`new`, { cwd: fixturePath }))
  t.is(result.code, 0)
})

test(`gatsby develop on an directory without required files exits `, async t => {
  const error = await t.throws(gatsbyCmd(`develop`, { cwd: fixturePath }))
  t.is(error.code, 1)
})
