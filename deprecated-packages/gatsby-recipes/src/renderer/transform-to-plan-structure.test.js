import transform from "./transform-to-plan-structure"

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
  const [npmPackage, ...files] = transform(fixture)

  expect(npmPackage.resourceDefinitions.name).toEqual(`gatsby`)
  expect(npmPackage.newState).toEqual(`gatsby@latest`)
  expect(files).toHaveLength(2)
})
