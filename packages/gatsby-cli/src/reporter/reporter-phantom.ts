import * as reporterActionsForTypes from "./redux/actions";
import { ActivityTypes } from "./constants";
import { Span } from "opentracing";

type ICreatePhantomReporterArguments = {
  text: string;
  id: string;
  span: Span;
  reporterActions: typeof reporterActionsForTypes;
};

export type IPhantomReporter = {
  start(): void;
  end(): void;
  span: Span;
};

export const createPhantomReporter = ({
  text,
  id,
  span,
  reporterActions,
}: ICreatePhantomReporterArguments): IPhantomReporter => {
  return {
    start(): void {
      reporterActions.startActivity({
        id,
        text,
        type: ActivityTypes.Hidden,
      });
    },

    end(): void {
      span.finish();

      reporterActions.endActivity({
        id,
        status: "SUCCESS",
      });
    },

    span,
  };
};
