const transform = require(`./transform-to-plan-structure`)

const fixture = {
  children: [
    {
      children: [
        {
          type: `NPMPackage`,
          children: [
            {
              text: `{"newState": "gatsby@latest", "_props": {"name": "gatsby"}}`,
            },
          ],
        },
        {
          type: `File`,
          children: [
            {
              text: `{"currentState":"","newState":"/** foo */","describe":"Write foo.js","diff":"- Original  - 0/n+ Modified  + 1/n/n+ /** foo */","_props":{"path":"foo.js","content":"/** foo */"}}`,
            },
          ],
        },
        {
          type: `File`,
          children: [
            {
              text: `{"currentState":"","newState":"/** foo2 */","describe":"Write foo2.js","diff":"- Original  - 0/n+ Modified  + 1/n/n+ /** foo2 */","_props":{"path":"foo2.js","content":"/** foo2 */"}}`,
            },
          ],
        },
      ],
    },
  ],
}

test(`transforms the render output`, async () => {
  const result = transform(fixture)

  expect(result.NPMPackage[0].resourceDefinitions.name).toEqual(`gatsby`)
  expect(result.NPMPackage[0].newState).toEqual(`gatsby@latest`)
  expect(result.File).toHaveLength(2)
})
