jest.mock(`node-fetch`, () => require(`fetch-mock-jest`).sandbox())
import fetch from "node-fetch"

export function mockReadmeLoader() {
  fetch.mock(/^https:\/\/unpkg.com\/.+/, `README`)
}
