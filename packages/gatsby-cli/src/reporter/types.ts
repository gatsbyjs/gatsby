// eslint-disable-next-line @typescript-eslint/naming-convention
import * as ActionCreators from "./redux/actions";
// TODO: This needs to be implemented when redux/acitons is converted to TS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CreateLogAction = any;

export type ErrorMeta =
  | {
      id: string;
      error?: Error | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [id: string]: any;
    }
  | string
  | Error
  | Array<ErrorMeta>;

export type ILogIntent = {
  type: "LOG_INTENT";
  payload:
    | {
        name: "createLog";
        args: Parameters<(typeof ActionCreators)["createLog"]>;
      }
    | {
        name: "createPendingActivity";
        args: Parameters<(typeof ActionCreators)["createPendingActivity"]>;
      }
    | {
        name: "setStatus";
        args: Parameters<(typeof ActionCreators)["setStatus"]>;
      }
    | {
        name: "startActivity";
        args: Parameters<(typeof ActionCreators)["startActivity"]>;
      }
    | {
        name: "endActivity";
        args: Parameters<(typeof ActionCreators)["endActivity"]>;
      }
    | {
        name: "updateActivity";
        args: Parameters<(typeof ActionCreators)["updateActivity"]>;
      }
    | {
        name: "setActivityErrored";
        args: Parameters<(typeof ActionCreators)["setActivityErrored"]>;
      }
    | {
        name: "setActivityStatusText";
        args: Parameters<(typeof ActionCreators)["setActivityStatusText"]>;
      }
    | {
        name: "setActivityTotal";
        args: Parameters<(typeof ActionCreators)["setActivityTotal"]>;
      }
    | {
        name: "activityTick";
        args: Parameters<(typeof ActionCreators)["activityTick"]>;
      };
};

type PageMode = "SSG" | "DSG" | "SSR";

type IGatsbyPageComponent = {
  componentPath: string;
  pages: Set<string>;
  isSlice: boolean;
};
type IGatsbyPage = {
  mode?: PageMode | undefined;
};
type IGatsbyFunction = {
  functionRoute: string;
  originalAbsoluteFilePath: string;
};

export type IRenderPageArgs = {
  pages: Map<string, IGatsbyPage>;
  components: Map<string, IGatsbyPageComponent>;
  functions: Array<IGatsbyFunction>;
  root: string;
};

export type ReporterMessagesFromChild = ILogIntent;

export { ActionCreators };
