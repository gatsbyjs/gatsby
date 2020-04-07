- [x] Make root configurable/dynamic
- [x] Make recipe configurable (theme-ui/eslint/jest)
- [x] Exit upon completion

- [x] Move into gatsby repo
- [x] Run as a command
- [x] Boot up server as a process
- [x] Then run the CLI
- [ ] Clean up server after

## Near future

- [x] Make it support relative paths for custom recipes (./src/recipes/foo.mdx)
- [ ] Document the supported components and trivial guide on recipe authoring (help)
- [ ] Theme UI preset selection (runs dependent install and file write)
- [ ] Move to more random port

## alpha

- [x] Handle `dev` in NPMPackage
- [ ] Make `dependencyType` in NPMPackage an enum
- [ ] Add large warning to recipes output that this is an experimental feature & might change at any moment + link to docs / umbrella issue for bug reports & discussions
- [x] Step by step design
- [ ] Select input supported recipes
- [ ] Make port selection dynamic
- [x] Use `fs-extra`
- [x] Handle object style plugins
- [x] Improve gatsby-config test
- [ ] use yarn/npm based on the user config
- [x] convert to xstate
- [ ] reasonably test resources
- [x] add Joi for validating resource objects
- [ ] handle error states
- [x] handle template strings in JSX parser
- [ ] integration test for each resource (read, create, update, delete)

## Near-ish future

- [ ] Make a proper "Config" provider to add recipes dir, store data, etc.
- [ ] Move parsing to the server
- [ ] init.js for providers to setup clients
- [ ] validate resource config
