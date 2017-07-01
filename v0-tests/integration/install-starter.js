import test from 'ava'
import fse from 'fs-extra'
import Promise from 'bluebird'
const fs = Promise.promisifyAll(fse)
const tmpdir = require(`os`).tmpdir()

import { gatsby } from '../support'

test(`calling gatsby new succesfully creates new site from default starter`, async t => {
  const sitePath = `${tmpdir}/gatsby-default-starter`
  await fs.remove(sitePath)
  const noArgs = await gatsby([`new`, sitePath])
  const file = await fs.statAsync(`${sitePath}/html.js`)

  t.is(noArgs.code, 0)
  t.truthy(file)
})
