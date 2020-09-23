// Given a absolutePath that has a collection marker it will extract the Model.
// /foo/bar/{Model.bar} => Model
export function extractModel(absolutePath: string): string {
  const model = /\{([a-zA-Z]+)\./.exec(absolutePath)

  //  This shouldn't happen - but TS requires us to validate
  if (!model) {
    throw new Error(
      `PageCreator: An error occured extracting the Model from the slug parts. This is likely a bug within Gatsby and not your code. Please report it to us if you run into this.`
    )
  }

  return model[1]
}

// Remove the file extension from the end of a path
export function removeFileExtension(absolutePath: string): string {
  return absolutePath.replace(/\.[a-z]+$/, ``)
}

// This extracts all information in an absolute path to an array of each collection part
// /foo/{Model.bar}/{Model.baz} => ['Model.bar', 'Model.baz']
export function extractAllCollectionSegments(
  absolutePath: string
): Array<string> {
  const slugParts = /(\{.*\})/g.exec(absolutePath)

  // This shouldn't happen - but TS requires us to validate
  if (!slugParts) {
    throw new Error(
      `PageCreator: An error occured building the slug parts. This is likely a bug within Gatsby and not your code. Please report it to us if you run into this.`
    )
  }

  return slugParts
}

// Given a filePath part that is a collection marker it do this transformation:
// {Model.bar} => bar
// {Model.field__bar} => field__bar
// {Model.field__(Union)__bar} => field__bar
export function extractFieldWithoutUnion(filePart: string): string {
  return (
    extractField(filePart)
      // Ignore union syntax
      .replace(/\(.*\)__/g, ``)
  )
}

// Given a filePath part that is a collection marker it do this transformation:
// {Model.field__(Union)__bar} => field__(Union)__bar
export function extractField(filePart: string): string {
  return (
    filePart
      .replace(/(\{|\})/g, ``)
      // Remove Model
      .replace(/[A-Z][a-zA-Z]+\./, ``)
  )
}

// Used to convert filePath field accessors to js syntax accessors.
// e.g.
//   foo__bar => foo.bar
// This can then be used with _.get
export function switchToPeriodDelimiters(filePart: string): string {
  // replace access by periods
  return filePart.replace(/__/g, `.`)
}

// Converts the part of the file from something like `(Union)` to `... on Union`
export function convertUnionSyntaxToGraphql(filePart: string): string {
  return filePart.replace(/\(/g, `... on `).replace(/\)/g, ``)
}

// Compose function to chain multiple methods from this file together
// e.g.
// compose(extractFieldWithoutUnion, switchToPeriodDelimters)(`{Model.foo__bar}`)
export function compose(
  ...functions: Array<(filePart: string) => string>
): (filePart: string) => string {
  return (filePart: string): string =>
    functions.reduce((value, fn) => fn(value), filePart)
}
