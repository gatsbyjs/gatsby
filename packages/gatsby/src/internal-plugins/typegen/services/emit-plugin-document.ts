import { IDefinitionMeta, writeFileContent } from "../internal/utils"

interface IEmitPluginDocumentService {
  (definitions: Array<IDefinitionMeta>): Promise<void>
}

interface IMakeEmitPluginDocumentService {
  (deps: { filePath: string }): IEmitPluginDocumentService
}

export const makeEmitPluginDocumentService: IMakeEmitPluginDocumentService =
  ({ filePath }) =>
  async (definitions): Promise<void> => {
    definitions = definitions.filter(def => def.printedAst)

    if (definitions.length === 0) {
      return
    }

    const printedDocument = definitions
      .map(def => def.printedAst || ``)
      .filter(Boolean)
      .join(`\n\n`)
    await writeFileContent(filePath, printedDocument)
  }
