import { ScriptProps } from "./gatsby-script"

const _collectedScriptsByPage = new Map()

export const collectedScriptsByPage = {
  get(pathname: string): Array<ScriptProps> {
    return _collectedScriptsByPage.get(pathname) || []
  },
  set(pathname: string, collectedScript: ScriptProps): void {
    const currentCollectedScripts = _collectedScriptsByPage.get(pathname) || []
    currentCollectedScripts.push(collectedScript)
    _collectedScriptsByPage.set(pathname, currentCollectedScripts)
  },
  delete(pathname: string): void {
    _collectedScriptsByPage.delete(pathname)
  },
}
