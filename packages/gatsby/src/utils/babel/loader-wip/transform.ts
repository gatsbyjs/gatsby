/*
 * Partially adapted from @babel/core (MIT license).
 */

import traverse from '@babel/traverse'
import generate from '@babel/generator'
import normalizeFile from '@babel/core/lib/transformation/normalize-file'
import normalizeOpts from '@babel/core/lib/transformation/normalize-opts'
import loadBlockHoistPlugin from '@babel/core/lib/transformation/block-hoist-plugin'
import PluginPass from '@babel/core/lib/transformation/plugin-pass'

import getConfig from './get-config'
import { consumeIterator } from './util'

function getTraversalParams(file: any, pluginPairs: any[]) {
  const passPairs = []
  const passes = []
  const visitors = []

  for (const plugin of pluginPairs.concat(loadBlockHoistPlugin())) {
    const pass = new PluginPass(file, plugin.key, plugin.options)
    // @ts-ignore
    passPairs.push([plugin, pass])
    // @ts-ignore
    passes.push(pass)
    // @ts-ignore
    visitors.push(plugin.visitor)
  }

  return { passPairs, passes, visitors }
}

function invokePluginPre(file: any, passPairs: any[]) {
  for (const [{ pre }, pass] of passPairs) {
    if (pre) {
      pre.call(pass, file)
    }
  }
}

function invokePluginPost(file: any, passPairs: any[]) {
  for (const [{ post }, pass] of passPairs) {
    if (post) {
      post.call(pass, file)
    }
  }
}

function transformAstPass(file: any, pluginPairs: any[]) {
  const { passPairs, passes, visitors } = getTraversalParams(file, pluginPairs)

  invokePluginPre(file, passPairs)
  const visitor = traverse.visitors.merge(
    visitors,
    passes,
    // @ts-ignore - the exported types are incorrect here
    file.opts.wrapPluginVisitorMethod
  )

  traverse(file.ast, visitor, file.scope)

  invokePluginPost(file, passPairs)
}

function transformAst(file: any, babelConfig: any) {
  for (const pluginPairs of babelConfig.passes) {
    transformAstPass(file, pluginPairs)
  }
}

export default function transform(
  source: string,
  inputSourceMap: object | null | undefined,
  loaderOptions: any,
  filename: string,
  target: string,
  overrides: object,
) {
  // @ts-ignore
  const babelConfig = getConfig.call(this, {
    source,
    loaderOptions,
    inputSourceMap,
    target,
    filename,
    overrides,
  })

  const file = consumeIterator(
    normalizeFile(babelConfig.passes, normalizeOpts(babelConfig), source)
  )

  transformAst(file, babelConfig)

  const { code, map } = generate(file.ast, file.opts.generatorOpts, file.code)

  return { code, map }
}
