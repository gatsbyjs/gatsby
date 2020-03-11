import Configstore from "configstore"
import prompts from "prompts"
import report from "../reporter"

interface IConfigStore {
  settings?: {
    [key: string]: string
  }
  get(key: string): string
  set(key: string, value: string): void
}

let conf: IConfigStore
try {
  conf = new Configstore(`gatsby`, {}, { globalConfigPath: true })
} catch (e) {
  // This should never happen (?)
  conf = {
    settings: {
      "cli.packageManager": ``,
    },
    get: (key: string): string => conf.settings![key],
    set: (key: string, value: string): void => {
      conf.settings![key] = value
    },
  }
}

const packageMangerConfigKey = `cli.packageManager`
export const getPackageManager = (): string => conf.get(packageMangerConfigKey)
export const setPackageManager = (packageManager: string): void => {
  conf.set(packageMangerConfigKey, packageManager)
  report.info(`Preferred package manager set to "${packageManager}"`)
}

export const promptPackageManager = async (): Promise<string> => {
  const promptsAnswer: {
    package_manager: string
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
