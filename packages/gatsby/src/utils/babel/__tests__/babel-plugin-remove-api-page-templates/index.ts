import runner from "@babel/helper-plugin-test-runner"

/**
 * This suite is the same as `babel-plugin-remove-api` except it tests against files
 * that are page templates.
 *
 * `@babel/helper-plugin-test-runner` helps us generate output fixtures
 * to test against so it makes sense to have a separate suite and do our mocking here.
 */

jest.mock(`../../babel-module-exports-helpers`, () => {
  const original = jest.requireActual(`../../babel-module-exports-helpers`)

  return {
    ...original,
    isPageTemplate: (): boolean => true, // Simulate running `babel-plugin-remove-api` on page templates
  }
})

/**
 * `@babel/helper-plugin-test-runner` runs against all subdirs in the adjacent `fixtures` directory.
 * @see {@link https://babel.dev/docs/en/babel-helper-plugin-test-runner} for docs
 * @see {@link https://github.com/babel/babel/blob/main/packages/babel-helper-plugin-test-runner} for source code
 */
runner(__dirname)
