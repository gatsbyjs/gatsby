# Development/Contribution Docs

So, you'd like to help contribute to the plugin? Here are some instructions to get you started

## Requirements

To run tests and do development work with this repo, you'll need:

- yarn
- node 10 or later
- docker
- docker-compose

## Setup

1. first, clone the repository from github. you'll probably want to use a fork if you plan to create a PR
2. then, `yarn` at the root of the repo to install all dependencies for all workspaces
3. `yarn build` will then build the plugin
4. `yarn docker-start -d` will start a local wordpress instance and build an image with the specified plugins for running integration tests. the docker environment will reset

### Running Tests

- `yarn test` will run the entire suite
- `yarn test-schema` will run the schema integration suite and the increment.
- `yarn test-schema-watch` will watch the first schema suite.
- `yarn test-schema-first` will run the first schema suite. you can pass jest arguments here
- `yarn test-schema-increment` will run the second schema suite
- `yarn test-build` will run the build integration suite
- `yarn test-build-watch` will watch the build integration suite
- `yarn test-update` will run `-u` for all schema and build integration suites.

### Changing WordPress plugin versions

if you're bumping plugin versions, you can:

1. edit the versions as desired in `docker-compose.yml` in the `build.args` for `wordpress` service
2. run `yarn docker-start -d` to detach, force re-build images and re-create containers, and ensure the plugins directory (volume) is renewed between builds
3. then when you run `yarn test-schema` you should see a diff in the snapshots that demonstrates the change in schema with the changed plugin versions.
4. if you want, you can here run `yarn test-update` to run `jest -u` with all the integration suites
