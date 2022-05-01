import fs from "fs"
import glob from "glob"
import chalk from "chalk"

export function printDeprecationWarnings(): void {
  const deprecatedApis: ReadonlyArray<string> = []
  const fixMap: Record<string, Record<"newName" | "docsLink", string>> = {}
  const deprecatedLocations: Record<string, Array<string>> = {}

  glob
    .sync(`{,!(node_modules|public)/**/}*.js`, { nodir: true })
    .forEach(file => {
      const fileText = fs.readFileSync(file)
      const matchingApis = deprecatedApis.filter(api => fileText.includes(api))
      matchingApis.forEach(api => deprecatedLocations[api].push(file))
    })

  deprecatedApis.forEach(api => {
    if (deprecatedLocations[api].length) {
      console.log(
        `%s %s %s %s`,
        chalk.cyan(api),
        chalk.yellow(`is deprecated. Please use`),
        chalk.cyan(fixMap[api].newName),
        chalk.yellow(
          `instead. For migration instructions, see ${fixMap[api].docsLink}\nCheck the following files:`
        )
      )
      console.log()
      deprecatedLocations[api].forEach(file => console.log(file))
      console.log()
    }
  })
}
