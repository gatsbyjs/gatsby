const errorOverlayHandler = require(`../error-overlay-handler`)
const {
  ERRORS,
  ERROR_TYPES,
  clearErrorOverlay,
  reportErrorOverlay,
  reportGenericErrorOverlay,
  reportQueryErrorOverlay,
} = errorOverlayHandler

import * as ErrorOverlay from "react-error-overlay"

jest.mock(`react-error-overlay`, () => {
  return {
    reportBuildError: jest.fn(),
    dismissBuildError: jest.fn(),
    startReportingRuntimeErrors: jest.fn(),
    setEditorHandler: jest.fn(),
  }
})

describe(`errorOverlayHandler`, () => {
  it(`should have 2 error types`, () => {
    expect(Object.keys(ERROR_TYPES)).toHaveLength(2)
    expect(ERROR_TYPES.GENERIC).toEqual(`GENERIC`)
    expect(ERROR_TYPES.QUERY).toEqual(`QUERY`)
  })
  it(`should initially have 2 empty error arrays`, () => {
    expect(Object.keys(ERRORS)).toHaveLength(2)
    expect(ERRORS.GENERIC).toHaveLength(0)
    expect(ERRORS.QUERY).toHaveLength(0)
  })
  describe(`clearErrorOverlay()`, () => {
    beforeEach(() => {
      reportGenericErrorOverlay(`error`)
    })
    it(`should clear specific error type`, () => {
      expect(ERRORS.GENERIC).toHaveLength(1)
      clearErrorOverlay(ERROR_TYPES.GENERIC)
      expect(ERRORS.GENERIC).toHaveLength(0)
    })
    it(`should return true when error overlay is cleared`, () => {
      const isCleared = clearErrorOverlay(ERROR_TYPES.GENERIC)
      expect(ERRORS.GENERIC).toHaveLength(0)
      expect(isCleared).toBe(true)
    })
    it(`should call ErrorOverlay to dismiss build errors`, () => {
      clearErrorOverlay(ERROR_TYPES.GENERIC)
      expect(ErrorOverlay.dismissBuildError).toHaveBeenCalled()
    })
    it(`should return false when error overlay is not cleared`, () => {
      const isCleared = clearErrorOverlay(ERROR_TYPES.QUERY)
      expect(ERRORS.QUERY).toHaveLength(0)
      expect(isCleared).toBe(false)
    })
    it(`should return false when clearCondition is falsy`, () => {
      const isCleared = clearErrorOverlay(ERROR_TYPES.GENERIC, false)
      expect(ERRORS.GENERIC).toHaveLength(0)
      expect(isCleared).toBe(false)
    })
  })
  describe(`reportErrorOverlay()`, () => {
    it(`should return a function`, () => {
      expect(
        typeof reportErrorOverlay(`random`)
      ).toBe(`function`)
    })
    it(`should not add error if it's empty`, () => {
      reportQueryErrorOverlay(``)
      expect(ERRORS.QUERY).toHaveLength(0)
    })
    it(`should add error if it has a truthy value`, () => {
      const errorValue = `value`
      reportQueryErrorOverlay(errorValue)
      expect(ERRORS.QUERY).toHaveLength(1)
      expect(ERRORS.QUERY[0]).toEqual(errorValue)
    })
    it(`should call error overlay to report a generic build error`, () => {
      reportGenericErrorOverlay(`error`)
      expect(ErrorOverlay.reportBuildError).toHaveBeenCalled()
    })
    it(`should call error overlay to report a query build error`, () => {
      reportQueryErrorOverlay(`error`)
      expect(ErrorOverlay.reportBuildError).toHaveBeenCalled()
    })
    it(`should call a callback if one is passed as option`, () => {
      const mockedCallback = jest.fn()
      reportGenericErrorOverlay(`error`, { callback: mockedCallback })
      expect(mockedCallback).toHaveBeenCalled()
    })
  })
})
