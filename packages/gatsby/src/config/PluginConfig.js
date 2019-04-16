import { parse } from "@babel/parser"
import serialize from "babel-literal-to-ast"

export default class PluginConfig {
  /**
   *
   * @param {String} name - name of plugin
   * @param {String} parent - name of plugin's parent plugin or 'root' if no parent
   * @param {Object} siteMetadata - JS Object configuring siteMetadata
   * @param {Object} configObject - JS Object configuring plugin
   * @param {String} configString - String of JS code configuring plugin
   */
  constructor(
    name,
    parent = `root`,
    siteMetadata = {},
    configObject = name,
    configString = ``
  ) {
    this.name = name
    this.parent = parent
    this.siteMetadata = siteMetadata
    this.configObject = configObject
    this.configString = configString
  }

  static configAstFromString(configString) {
    const fullProgram = `const configObject = ${configString}`
    const fullAST = parse(fullProgram)
    const objectAST = fullAST.program.body[0].declarations[0].init
    return objectAST
  }

  get configObjectAst() {
    return serialize(this.configObject)
  }

  get siteMetadataAst() {
    return serialize(this.siteMetadata)
  }

  get configStringAst() {
    return this.configAstFromString(this.configString)
  }

  get pluginName() {
    return this.name
  }

  get pluginParentName() {
    return this.parent
  }
}
