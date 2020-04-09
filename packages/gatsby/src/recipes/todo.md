- [x] Make root configurable/dynamic
- [x] Make recipe configurable (theme-ui/eslint/jest)
- [x] Exit upon completion

- [x] Move into gatsby repo
- [x] Run as a command
- [x] Boot up server as a process
- [x] Then run the CLI
- [x] Clean up server after

## Near future

- [x] Make it support relative paths for custom recipes (./src/recipes/foo.mdx)
- [ ] Document the supported components and trivial guide on recipe authoring (help)
- [ ] Move to more random port

## alpha

- [x] Handle `dev` in NPMPackage
- [x] add Joi for validating resource objects
- [x] handle template strings in JSX parser
- [x] Step by step design
- [x] Use `fs-extra`
- [x] Handle object style plugins
- [x] Improve gatsby-config test
- [x] convert to xstate
- [ ] Make `dependencyType` in NPMPackage an enum (joi2gql doesn't handle this right now from Joi enums)
- [ ] Add large warning to recipes output that this is an experimental feature & might change at any moment + link to docs / umbrella issue for bug reports & discussions
- [ ] use yarn/npm based on the user config
- [ ] reasonably test resources
- [ ] integration test for each resource (read, create, update, delete)
- [ ] show plan to create/update or that nothing is necessary & then show in `<static>` what was done
- [ ] handle error states
- [ ] have File only pull from remote files for now until multiline strings work in MDX
- [ ] diff all resource changes
- [ ] move code to its own package `gatsby-recipes`
- [ ] write blog post

## Near-ish future

- [ ] Make a proper "Config" provider to add recipes dir, store data, etc.
- [ ] Move parsing to the server
- [ ] init.js for providers to setup clients
- [ ] validate resource config
- [ ] Theme UI preset selection (runs dependent install and file write)
- [ ] Select input supported recipes
- [ ] Refactor resource state to use Redux & record runs in local db
