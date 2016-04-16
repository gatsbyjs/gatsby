import test from 'ava'
import { gatsby } from '../support'

test('cli can be called and exits with 0', async t => {
  const noArgs = await gatsby()
  t.is(noArgs.code, 0)
})

test('cli returns help when called without args', async t => {
  const noArgs = await gatsby([])
  const help = await gatsby(['--help'])
  t.is(noArgs.stdout, help.stdout)
})

test('cli returns help when called with unknown args', async t => {
  const asdf = await gatsby(['asdf'])
  const help = await gatsby(['--help'])
  t.is(asdf.stdout, help.stdout)
})
