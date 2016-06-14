import test from 'ava'
import fs from 'fs-extra'
import Promise from 'bluebird'
const remove = Promise.promisify(fs.remove)
const tmpdir = require('os').tmpdir()

import { gatsby } from '../support'

test('calling gatsby new succesfully creates new site from default starter', async t => {
  await remove(`${tmpdir}/gatsby-default-starter`)
  const noArgs = await gatsby(['new', `${tmpdir}/tmp/gatsby-default-starter`])
  console.log(noArgs)
  t.is(noArgs.code, 0)
})
