import reporterActions from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { Span } from "opentracing"

export interface ICreatePhantomReporterArgumnents {
  text: string
  id: string
  span: Span
}

export type PhantomReporter = ReturnType<typeof createPhantomReporter>

export const createPhantomReporter = ({
  text,
  id,
  span,
}: ICreatePhantomReporterArgumnents) => {
  return {
    start: () => {
      reporterActions.startActivity({
        id,
        text,
        type: ActivityTypes.Hidden,
      })
    },
    end() {
      span.finish()

      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Success,
      })
    },
    span,
  }
}
