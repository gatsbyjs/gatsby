const mdxLoader = require("./mdx-loader");
const prettier = require("prettier");

const fixtures = [
  [
    "one.mdx",
    {
      internal: { type: "File" },
      sourceInstanceName: "webpack-test-fixtures",
      absolutePath: "/fake/one.mdx"
    },
    "# some heading"
  ],
  [
    "two.mdx",
    {
      internal: { type: "File" },
      sourceInstanceName: "webpack-test-fixtures",
      absolutePath: "/fake/two.mdx"
    },
    `# Two things

some paragraph content

**bold**`
  ]
];

describe("mdx-loader", () => {
  expect.addSnapshotSerializer({
    print(val, serialize) {
      return prettier.format(val, { parser: "babylon" });
    },
    test() {
      return true;
    }
  });
  test.each(fixtures)(
    "snapshot %s",
    async (filename, fakeGatsbyNode, content) => {
      const loader = mdxLoader.bind({
        async() {
          return (err, result) => {
            expect(err).toBeNull();
            expect(result).toMatchSnapshot();
          };
        },
        query: {
          getNodes() {
            return fixtures.map(([filename, node, ...other]) => node);
          },
          pluginOptions: {}
        },
        resourcePath: fakeGatsbyNode.absolutePath
      });
      await loader(content);
    }
  );
});
