import React from "react";
import TestRenderer from "react-test-renderer";

import MDXRenderer from "./mdx-renderer";

describe("mdx-renderer", () => {
  test("renders nothing if there are no children", () => {
    expect(TestRenderer.create(<MDXRenderer />).toJSON()).toEqual(null);
  });

  test.skip("renders content if function body is passed in", () => {
    const result = TestRenderer.create(<MDXRenderer>{`return 2`}</MDXRenderer>);
    expect(result.toJSON()).toEqual("return 2");
  });

  test("renders React elements when scope is provided", () => {
    const result = TestRenderer.create(
      <MDXRenderer
        scope={{ React: React }}
      >{`return () => React.createElement('div')`}</MDXRenderer>
    );

    expect(result.toJSON()).toEqual({ type: "div", props: {}, children: null });
  });
});
