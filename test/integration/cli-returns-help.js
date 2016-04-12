import test from 'ava'
import path from 'path'
import { spawn } from '../support'

const gatsby = path.resolve('..', '..', 'bin', 'gatsby.js')
const starterPath = path.resolve('..', 'fixtures', 'starter-wrappers')

test('cli can be called and exits with 0', async t => {
  const noArgs = await spawn(gatsby, [], { cwd: starterPath })
  t.is(noArgs.code, 0)
})

test('cli returns help when called without args', async t => {
  const noArgs = await spawn(gatsby, [], { cwd: starterPath })
  const help = await spawn(gatsby, ['--help'], { cwd: starterPath })
  t.is(noArgs.stdout, help.stdout)
})

test('cli returns help when called with unknown args', async t => {
  const asdf = await spawn(gatsby, ['asdf'], { cwd: starterPath })
  const help = await spawn(gatsby, ['--help'], { cwd: starterPath })
  t.is(asdf.stdout, help.stdout)
})
