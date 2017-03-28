import test from 'ava'
import fse from 'fs-extra'
import Promise from 'bluebird'
import { gatsby } from '../support'

const fs = Promise.promisifyAll(fse)
const tmpdir = require('os').tmpdir()


// eslint-disable-next-line
test('calling gatsby new succesfully creates new site from default starter', async (t) => {
  const sitePath = `${tmpdir}/gatsby-default-starter`
  await fs.remove(sitePath)
  const noArgs = await gatsby(['new', sitePath])
  const file = await fs.statAsync(`${sitePath}/html.js`)

  t.is(noArgs.code, 0)
  t.truthy(file)
})
