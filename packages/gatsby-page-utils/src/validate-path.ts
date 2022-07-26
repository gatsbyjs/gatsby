import { parse } from "path"
import { isMatch } from "micromatch"

const tsDeclarationExtTest = /\.d\.tsx?$/
const jsonYamlExtTest = /\.(json|ya?ml)$/

// https://github.com/facebook/jest/blob/v24.0.0-alpha.4/packages/jest-config/src/Defaults.js#L71
function isTestFile(filePath: string): boolean {
  const testPatterns = [
    `**/__tests__/**/*.(js|ts|jsx|tsx)`,
    `**/(*.)+(spec|test).(js|ts|jsx|tsx)`,
  ]

  return isMatch(filePath, testPatterns)
}

export function validatePath(path: string): boolean {
  // Disallow paths starting with an underscore (_) or dot (.)
  // and template-.
  // and .d.ts
  const parsedPath = parse(path)
  return (
    parsedPath.name.slice(0, 1) !== `_` &&
    parsedPath.name.slice(0, 1) !== `.` &&
    parsedPath.name.slice(0, 9) !== `template-` &&
    !tsDeclarationExtTest.test(parsedPath.base) &&
    !jsonYamlExtTest.test(parsedPath.base) &&
    !isTestFile(path.replace(/\\/g, `/`))
  )
}
