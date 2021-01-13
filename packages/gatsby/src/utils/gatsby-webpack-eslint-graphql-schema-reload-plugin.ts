/**
 * The problem: after GraphQL schema rebuilds, eslint loader keeps validating against
 * the old schema.
 *
 * This plugin replaces options of eslint-plugin-graphql during develop
 */
import { store } from "../redux"
import { eslintConfig } from "./eslint-config"
import { hasLocalEslint } from "./local-eslint-config-finder"
import { RuleSetRule, Compiler, RuleSetQuery } from "webpack"
import { GraphQLSchema } from "graphql"
import { reactHasJsxRuntime } from "./webpack-utils"

function isEslintRule(rule?: RuleSetRule): boolean {
  const options = rule?.use?.[0]?.options
  return options && typeof options.useEslintrc !== `undefined`
}

export class GatsbyWebpackEslintGraphqlSchemaReload {
  private plugin: { name: string }
  private schema: GraphQLSchema | null

  constructor() {
    this.plugin = { name: `GatsbyWebpackEslintGraphqlSchemaReload` }
    this.schema = null
  }

  findEslintOptions(compiler: Compiler): RuleSetQuery | undefined {
    const rules = compiler.options.module?.rules.find(isEslintRule)?.use
    const rule = Array.isArray(rules) ? rules[0] : rules
    return typeof rule === `object` ? rule?.options : undefined
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compile.tap(this.plugin.name, () => {
      const { schema, program } = store.getState()

      if (!this.schema) {
        // initial build
        this.schema = schema
        return
      }

      if (this.schema === schema || hasLocalEslint(program.directory)) {
        return
      }
      this.schema = schema

      // Original eslint config object from webpack rules
      const options = this.findEslintOptions(compiler)

      if (!options) {
        return
      }

      // Hackish but works:
      // replacing original eslint options object with updated config
      Object.assign(options, eslintConfig(schema, reactHasJsxRuntime()))
    })
  }
}
