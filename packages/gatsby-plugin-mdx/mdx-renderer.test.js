import React from "react";
import TestRenderer from "react-test-renderer";

import MDXRenderer from "./mdx-renderer";

describe("mdx-renderer", () => {
  test("fails if there is no content (function body is empty)", () => {
    /**
     * spyOn is used to silence the following console warning in this test

       ```
       console.error node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6884
       The above error occurred in one of your React components:
       in Unknown (created by Context.Consumer)
       in Unknown (created by Context.Consumer)
       in Unknown

       Consider adding an error boundary to your tree to customize error handling behavior.
       Visit https://fb.me/react-error-boundaries to learn more about error boundaries.
       ```
     */
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => TestRenderer.create(<MDXRenderer />)).toThrow(TypeError);
    spy.mockRestore();
  });

  test("renders content if function body is passed in", () => {
    const result = TestRenderer.create(
      <MDXRenderer>{`return () => 2`}</MDXRenderer>
    );
    expect(result.toJSON()).toEqual("2");
  });

  test("fails to render React elements without scope", () => {
    /**
     * spyOn is used to silence the following console warning in this test

       ```
       console.error node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6884
       The above error occurred in one of your React components:
       in Unknown (created by Context.Consumer)
       in Unknown (created by Context.Consumer)
       in Unknown

       Consider adding an error boundary to your tree to customize error handling behavior.
       Visit https://fb.me/react-error-boundaries to learn more about error boundaries.
       ```
     */
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      TestRenderer.create(
        <MDXRenderer>{`return () => React.createElement('div')`}</MDXRenderer>
      );
    }).toThrow(ReferenceError);
    spy.mockRestore();
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
