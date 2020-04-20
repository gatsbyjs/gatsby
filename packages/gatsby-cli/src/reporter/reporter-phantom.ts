import * as reporterActions from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { Span } from "opentracing"

interface ICreatePhantomReporterArguments {
  text: string
  id: string
  span: Span
}

export interface IPhantomReporter {
  start(): void
  end(): void
  span: Span
}

export const createPhantomReporter = ({
  text,
  id,
  span,
}: ICreatePhantomReporterArguments): IPhantomReporter => {
  return {
    start(): void {
      reporterActions.startActivity({
        id,
        text,
        type: ActivityTypes.Hidden,
      })
    },

    end(): void {
      span.finish()

      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Success,
      })
    },

    span,
  }
}
