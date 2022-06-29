// Since v2 of gatsby-source-mdx, we are using the resourceQuery feature
// of webpack's loaders to inject a content file into a page component.
// These helper functions are used to simplify working with these new
// page component path URI's.

// Split the path component URI without using the expensive URI.parse()
export const splitComponentPath = (componentPath: string): Array<string> => {
  // If the path does not include a question mark, we can assume its a regular path
  if (!componentPath.includes(`?`)) {
    return [componentPath]
  }

  const splitPath = componentPath.split(`?__contentFilePath=`)

  // We only support URI paths with the `?__contentFilePath=` parameter
  if (splitPath.length !== 2) {
    throw new Error(
      `The following page component must contain '?__contentFilePath=':\n${componentPath}`
    )
  }

  // Other URI parameters are not supported
  if (splitPath[1].includes(`&`)) {
    throw new Error(
      `You can not pass any other parameters to a page component URI as 'contentFilePath'. Remove the ampersand (&):\n${componentPath}`
    )
  }
  return splitPath
}

// Get the path to the actual js page component
export const getPathToLayoutComponent = (componentPath: string): string =>
  splitComponentPath(componentPath)[0]

// Get the path to the content file, falling back to the js component if no content file is given.
// Pages directly created from `.mdx` files
export const getPathToContentComponent = (componentPath: string): string => {
  const splitPath = splitComponentPath(componentPath)
  if (splitPath.length === 1) {
    return splitPath[0]
  }
  return splitPath[1]
}
