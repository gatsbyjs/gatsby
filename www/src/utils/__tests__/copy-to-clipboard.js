import copyToClipboard from "../copy-to-clipboard"

beforeEach(() => {
  window.navigator.clipboard = {
    writeText: jest.fn(),
  }

  document.execCommand = jest.fn()
  document.createRange = jest.fn()
  window.getSelection = jest.fn(() => {
    return {
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    }
  })
})

test(`it uses writeText API, by default`, async () => {
  const str = `waddup`
  await copyToClipboard(str)

  expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(str)
})

test(`it falls back to execCommand, if writeText is not defined`, async () => {
  window.navigator.clipboard = {}

  await copyToClipboard(`sup`)

  expect(document.execCommand).toHaveBeenCalledWith(`copy`)
  expect(document.execCommand).toHaveBeenCalledTimes(1)
})
