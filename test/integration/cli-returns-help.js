import test from 'ava'
import packageJson from '../../package.json'
import { gatsby } from '../support'

// eslint-disable-next-line
test('cli can be called and exits with 0', async (t) => {
  const noArgs = await gatsby()
  t.is(noArgs.code, 0)
})

// eslint-disable-next-line
test('cli returns help when called without args', async (t) => {
  const noArgs = await gatsby([])
  const help = await gatsby(['--help'])
  t.is(noArgs.stdout, help.stdout)
})

// eslint-disable-next-line
test('cli returns help when called with unknown args', async (t) => {
  const asdf = await gatsby(['asdf'])
  const help = await gatsby(['--help'])
  t.is(asdf.stdout, help.stdout)
})

// eslint-disable-next-line
test('cli does not return help when called with --version', async (t) => {
  const version = await gatsby(['--version'])
  const help = await gatsby(['--help'])
  t.not(version.stdout, help.stdout)
})

// eslint-disable-next-line
test('cli returns the gatsby version when called with --version', async (t) => {
  const versionCli = await gatsby(['--version'])
  const versionPackage = packageJson.version
  t.true(versionCli.stdout.indexOf(versionPackage) > -1)
})
