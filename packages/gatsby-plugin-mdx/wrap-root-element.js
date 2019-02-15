import React from "react";
import { MDXProvider } from "@mdx-js/tag";
import { MDXScopeProvider } from "./context";
// this import, unlike the more complicated one below, executes the
// mdx-scopes loader with no arguments. No funny-business.
import scopeContexts from "./loaders/mdx-scopes!";
/**
 * so, this import is weird right?
 *
 * # What it looks like:
 * we're importing a webpack loader directly into our runtime bundle
 *
 * # What it's actually doing:
 * We configure the `mdx-components` loader in gatsby-node's
 * `onCreateWebpackConfig`. The configuration sets the loader to handle its
 * own file, so if we import `./loaders/mdx-components`, the `mdx-components`
 * loader handles loading itself.
 *
 * # Why does this work?
 * The loader doesn't use the file argument to itself and instead returns
 * a generated file that includes the `gatsby-config` mdxPlugins wrapped in
 * require() statements. This results in the `mdxPlugins` being required
 * and available to the code after this import.
 *
 * # Have a better solution to this?
 * Submit a PR
 */
import { plugins as mdxPlugins } from "./loaders/mdx-components";

const componentsAndGuards = {};

const componentFromGuards = arr =>
  function GatsbyMDXComponentFinder(props) {
    const { Component } = arr.find(
      ({ guard }) => (guard ? guard(props) : true)
    );
    return <Component {...props} />;
  };

const WrapRootElement = ({ element }) => {
  mdxPlugins.forEach(({ guards = {}, components }) => {
    Object.entries(components).forEach(([componentName, Component]) => {
      if (componentsAndGuards[componentName]) {
        componentsAndGuards.push({ guard: guards[componentName], Component });
      } else {
        componentsAndGuards[componentName] = [
          { guard: guards[componentName], Component }
        ];
      }
    });
  });

  const components = Object.entries(componentsAndGuards)
    .map(([name, arr]) => ({
      [name]: componentFromGuards(
        arr.concat({ guard: undefined, Component: name })
      )
    }))
    .reduce((acc, obj) => ({ ...acc, ...obj }), {});

  return (
    <MDXScopeProvider __mdxScope={scopeContexts}>
      <MDXProvider components={components}>{element}</MDXProvider>
    </MDXScopeProvider>
  );
};

export default WrapRootElement;
