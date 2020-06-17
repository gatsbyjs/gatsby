import detectPort from "detect-port"
import { reporter } from "gatsby-reporter"
import prompts from "prompts"

export const detectPortInUseAndPrompt = async (
  port: number
): Promise<number> => {
  let foundPort = port
  const detectedPort = await detectPort(port).catch((err: Error) =>
    reporter.panic(err)
  )
  if (port !== detectedPort) {
    reporter.log(`\nSomething is already running at port ${port}`)
    const response = await prompts({
      type: `confirm`,
      name: `newPort`,
      message: `Would you like to run the app at another port instead?`,
      initial: true,
    })
    if (response.newPort) {
      foundPort = detectedPort
    } else {
      throw new Error(`USER_REJECTED`)
    }
  }

  return foundPort
}
