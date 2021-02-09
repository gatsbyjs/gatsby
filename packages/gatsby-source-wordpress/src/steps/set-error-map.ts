import { GatsbyReporter } from "~/utils/gatsby-types"
import { ERROR_MAP } from "../utils/report"

export function setErrorMap({ reporter }: { reporter: GatsbyReporter }): void {
  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }
}
