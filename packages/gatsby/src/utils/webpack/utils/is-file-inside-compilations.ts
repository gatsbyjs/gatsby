import { Compilation, NormalModule } from "webpack"

const filesInsideDevelopHtmlCompilation = new Set<string>()

function removeQueryParams(path: string): string {
  return path.split(`?`)[0]
}

export function setFilesFromDevelopHtmlCompilation(
  developHtmlCompilation: Compilation
): void {
  filesInsideDevelopHtmlCompilation.clear()

  for (const module of developHtmlCompilation.modules) {
    if (module instanceof NormalModule && module.resource) {
      filesInsideDevelopHtmlCompilation.add(removeQueryParams(module.resource))
    }
  }
}

/**
 * Checks if a file is inside either `develop` or `develop-html` compilation. Used to determine if
 * we should generate codeframe for this file for error overlay.
 */
export function isFileInsideCompilations(
  absolutePath: string,
  developBrowserCompilation: Compilation
): boolean {
  if (filesInsideDevelopHtmlCompilation.has(absolutePath)) {
    return true
  }

  for (const module of developBrowserCompilation.modules) {
    if (module instanceof NormalModule && module.resource) {
      if (absolutePath === removeQueryParams(module.resource)) {
        return true
      }
    }
  }

  return false
}
