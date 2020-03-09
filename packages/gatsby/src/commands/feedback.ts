import {
  setFeedbackDisabledValue,
  showFeedbackRequest,
} from "../utils/feedback"

import { IProgram } from "./types"

// This is because we splat command line arguments onto this object.
// A good refactor would be to put this inside a key like `cliArgs`
interface IFeedbackProgram extends IProgram {
  disable?: boolean
  enable?: boolean
}

export default async ({
  disable,
  enable,
  report,
}: IFeedbackProgram): Promise<void> => {
  if (disable) {
    report.info(`Disabling gatsby feedback requests`)

    return setFeedbackDisabledValue(true)
  }

  if (enable) {
    report.info(`Enabling gatsby feedback requests`)

    return setFeedbackDisabledValue(false)
  }

  return showFeedbackRequest()
}
