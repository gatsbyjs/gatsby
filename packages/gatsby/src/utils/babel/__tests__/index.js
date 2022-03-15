import runner from "@babel/helper-plugin-test-runner"

/**
 * `@babel/helper-plugin-test-runner` runs against all subdirs in the adjacent `fixtures` directory.
 * @see {@link https://babel.dev/docs/en/babel-helper-plugin-test-runner} for docs
 * @see {@link https://github.com/babel/babel/blob/main/packages/babel-helper-plugin-test-runner} for source code
 */
runner(__dirname)
