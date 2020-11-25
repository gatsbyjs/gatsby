import { trackCli } from "gatsby-telemetry"
import runExperiments from "gatsby-experiments-cli"

export async function experimentsHandler(projectRoot: string): Promise<void> {
  trackCli(`EXPERIMENTS_CLI_RUN`)

  return runExperiments({
    projectRoot,
  })
}
