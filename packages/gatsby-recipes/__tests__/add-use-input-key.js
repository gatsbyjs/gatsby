import { transform } from "@babel/standalone"

import babelPluginAddUseInputKey from "../add-use-input-key"

const FIXTURE = `
export const [val, Other] = useInput()
export const [val2abc, Other2] = useInput()
export const foo = useInput()
`

test(`adds useInput key`, () => {
  const { code: result } = transform(FIXTURE, {
    plugins: [babelPluginAddUseInputKey],
  })

  expect(result)
    .toEqual(`export const [val, Other] = useInput("val", sendEvent);
export const [val2abc, Other2] = useInput("val2abc", sendEvent);
export const foo = useInput();`)
})

/*
export const [val, InputVal] = useInput({
  key: 'val',
  onChange: _sendInputEvent,
  other: 'stuff'
})
*/