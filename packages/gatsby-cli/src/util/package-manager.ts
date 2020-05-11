import { getConfigStore } from "gatsby-core-utils"
import prompts from "prompts"
import report from "../reporter"

type PackageManager = "yarn" | "npm"

const packageMangerConfigKey = `cli.packageManager`
export const getPackageManager = (): PackageManager =>
  getConfigStore().get(packageMangerConfigKey)
export const setPackageManager = (packageManager: PackageManager): void => {
  getConfigStore().set(packageMangerConfigKey, packageManager)
  report.info(`Preferred package manager set to "${packageManager}"`)
}

export const promptPackageManager = async (): Promise<PackageManager> => {
  const promptsAnswer: {
    package_manager: PackageManager
  } = await prompts([
    {
      type: `select`,
      name: `package_manager`,
      message: `Which package manager would you like to use ?`,
      choices: [
        { title: `yarn`, value: `yarn` },
        { title: `npm`, value: `npm` },
      ],
      initial: 0,
    },
  ])
  const response = promptsAnswer.package_manager
  if (response) {
    setPackageManager(response)
  }
  return response
}
