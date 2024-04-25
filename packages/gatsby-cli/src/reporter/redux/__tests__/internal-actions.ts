import type { Dispatch } from "redux";

import type { ActivityStatuses } from "../../constants";
import { ISetStatus, IGatsbyCLIState } from "../types";
import { GatsbyCLIStore } from "../";
import { IRenderPageArgs } from "../../types";

jest.useFakeTimers();

describe("setStatus action creator", () => {
  let mockStatus: ActivityStatuses | "" = "";
  let setStatus;

  const dispatchMockFn: Dispatch<ISetStatus> = <T extends ISetStatus>(
    action: T,
  ): T => {
    mockStatus = action.payload;
    return action;
  };

  const dispatch = jest.fn(dispatchMockFn);

  const setStatusWithDispatch = <T extends ISetStatus>(
    status: ActivityStatuses | "",
  ): T => setStatus(status)(dispatch);

  beforeAll(async () => {
    jest.doMock("../", () => {
      return {
        getStore: (): Partial<GatsbyCLIStore> => {
          return {
            getState: (): {
              logs: IGatsbyCLIState;
              pageTree: IRenderPageArgs;
            } => {
              return {
                logs: { status: mockStatus, messages: [], activities: {} },
                pageTree: {
                  pages: new Map(),
                  components: new Map(),
                  functions: [],
                  root: "/",
                },
              };
            },
          };
        },
      };
    });
    jest.resetModules();
    setStatus = (await import("../internal-actions")).setStatus;
  });

  afterAll(() => {
    jest.unmock("../");
  });

  beforeEach(() => {
    mockStatus = "";
    dispatch.mockClear();
  });

  it("debounces SUCCESS in case activities don't overlap", () => {
    setStatusWithDispatch("IN_PROGRESS");
    setStatusWithDispatch("SUCCESS");
    setStatusWithDispatch("IN_PROGRESS");
    setStatusWithDispatch("SUCCESS");

    // we should only emit initial IN_PROGRESS event
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "SET_STATUS",
      payload: "IN_PROGRESS",
    });

    jest.runOnlyPendingTimers();

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: "SET_STATUS",
      payload: "SUCCESS",
    });
  });

  it("debounces FAILED in case activities don't overlap", () => {
    setStatusWithDispatch("IN_PROGRESS");
    setStatusWithDispatch("SUCCESS");
    setStatusWithDispatch("IN_PROGRESS");
    setStatusWithDispatch("FAILED");

    // we should only emit initial IN_PROGRESS event
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "SET_STATUS",
      payload: "IN_PROGRESS",
    });

    jest.runOnlyPendingTimers();

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: "SET_STATUS",
      payload: "FAILED",
    });
  });

  it("doesn't wrongly emit SUCCESS when we are still in progress ", () => {
    setStatusWithDispatch("IN_PROGRESS");
    setStatusWithDispatch("SUCCESS");
    setStatusWithDispatch("IN_PROGRESS");

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "SET_STATUS",
      payload: "IN_PROGRESS",
    });

    jest.runOnlyPendingTimers();

    // we are still in progress, so we shouldn't emit anything other than initial IN_PROGRESS
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
