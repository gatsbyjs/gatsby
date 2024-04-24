import {
  setFeedbackDisabledValue,
  showFeedbackRequest,
} from "../utils/feedback";
import type { IProgram } from "./types";

// This is because we splat command line arguments onto this object.
// A good refactor would be to put this inside a key like `cliArgs`
type IFeedbackProgram = {
  disable?: boolean | undefined;
  enable?: boolean | undefined;
} & IProgram;

module.exports = async function feedback(
  program: IFeedbackProgram,
): Promise<void> {
  if (program.disable) {
    program.report.info("Disabling gatsby feedback requests");
    setFeedbackDisabledValue(true);
    return;
  }

  if (program.enable) {
    program.report.info("Enabling gatsby feedback requests");
    setFeedbackDisabledValue(false);
    return;
  }

  showFeedbackRequest();
};
