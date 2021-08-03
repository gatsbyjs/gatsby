import { ActivityStatuses, ActivityTypes } from "../../constants"
import { ISetStatus } from "../types"

jest.useFakeTimers()

describe(`integration`, () => {
  let dispatchSpy
  let internalActions

  const getDispatchedSetStatusActions = (): Array<ISetStatus> =>
    dispatchSpy.mock.calls
      .map(args => args[0])
      .filter(action => action.type === `SET_STATUS`)

  beforeEach(async () => {
    jest.resetModules()
    const { getStore } = require(`../`)
    dispatchSpy = jest.spyOn(getStore(), `dispatch`)
    internalActions = await import(`../actions`)
  })

  test(`Doesn't dispatch pre-emptive SUCCESS `, async () => {
    const { createPendingActivity, endActivity, startActivity } =
      internalActions

    startActivity({
      id: `activity-1`,
      text: `activity-1`,
      type: ActivityTypes.Spinner,
    })
    endActivity({ id: `activity-1`, status: ActivityStatuses.Success })
    startActivity({
      id: `activity-2`,
      text: `activity-2`,
      type: ActivityTypes.Spinner,
    })
    createPendingActivity({ id: `pending-activity` })
    endActivity({ id: `activity-2`, status: ActivityStatuses.Success })

    jest.runOnlyPendingTimers()

    let dispatchedSetStatusActions = getDispatchedSetStatusActions()

    // we don't expect to see SET_STATUS other than initial IN_PROGRESS
    // as we still have pending activity
    expect(dispatchedSetStatusActions.length).toEqual(1)
    expect(dispatchedSetStatusActions[0]).toEqual({
      type: `SET_STATUS`,
      payload: `IN_PROGRESS`,
      timestamp: expect.any(String),
    })

    endActivity({ id: `pending-activity`, status: ActivityStatuses.Cancelled })
    jest.runOnlyPendingTimers()

    dispatchedSetStatusActions = getDispatchedSetStatusActions()
    expect(dispatchedSetStatusActions.length).toEqual(2)
    expect(dispatchedSetStatusActions[0]).toEqual({
      type: `SET_STATUS`,
      payload: `IN_PROGRESS`,
      timestamp: expect.any(String),
    })
    expect(dispatchedSetStatusActions[1]).toEqual({
      type: `SET_STATUS`,
      payload: `SUCCESS`,
      timestamp: expect.any(String),
    })
  })
})
