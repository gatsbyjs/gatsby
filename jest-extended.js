import {
  toBeArrayOfSize,
  toBeFunction,
  toBeObject,
  toBeOneOf,
  toBeString,
  toContainAllValues,
  toContainKeys,
  toContainValue,
  toInclude,
  toSatisfyAll,
  toStartWith,
} from "jest-extended"

expect.extend({
  toBeArrayOfSize,
  toBeFunction,
  toBeObject,
  toBeOneOf,
  toBeString,
  toContainAllValues,
  toContainKeys,
  toContainValue,
  toInclude,
  toSatisfyAll,
  toStartWith,
})
