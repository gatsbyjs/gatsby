import * as fs from "fs-extra"
import * as t from "@babel/types"
import traverse from "@babel/traverse"
import { babelParseToAst } from "../babel-parse-to-ast"

type ComponentPath = string
type FunctionText = string
const prevSource: Map<ComponentPath, FunctionText> = new Map()

/**
 * Returns true when getServerData source is different from the previous time this function was called
 */
export async function getServerDataChanged(
  filename: ComponentPath
): Promise<boolean> {
  // TODO:
  // if (!isSSRPage(filename)) return false

  const prev = prevSource.get(filename)
  prevSource.delete(filename)

  if (
    !(await fs.pathExists(filename)) ||
    !(await fs.lstat(filename)).isFile()
  ) {
    return !!prev
  }
  const text = await fs.readFile(filename, `utf8`)

  // Avoid expensive AST checks for pages without getServerData
  if (!text.includes(`getServerData`)) {
    return !!prev // if it was set before - means it was changed
  }
  const source = extractSource(text, filename)
  prevSource.set(filename, source)

  if (!source) {
    // TODO: display error as there is getServerData in the code but we couldn't extract its source
    return true
  }
  if (source === prev) {
    return false
  }
  return true
}

/**
 * Extract source code of getServerData function from the source file
 */
function extractSource(text: string, filename: string): string {
  try {
    const id = `getServerData`
    const ast = babelParseToAst(text, filename)

    let source = ``
    traverse(ast, {
      ExportNamedDeclaration: path => {
        const declaration = path.node.declaration
        if (
          t.isFunctionDeclaration(declaration) &&
          declaration?.id?.name === id
        ) {
          // Workaround: using custom getSource() because path.getSource() was throwing errors
          source = getSource(text, path.node)
          return
        }
        if (
          t.isVariableDeclaration(declaration) &&
          t.isIdentifier(declaration.declarations[0].id) &&
          declaration.declarations[0].id.name === id
        ) {
          source = getSource(text, path.node)
          return
        }
      },
    })
    return source
  } catch (e) {
    return ``
  }
}

function getSource(text: string, node: t.Node): string {
  return node.end ? text.slice(node.start || 0, node.end) : ``
}
