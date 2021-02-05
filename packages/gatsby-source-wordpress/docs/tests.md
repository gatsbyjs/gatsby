# Running Tests

- `yarn test` will run the entire suite
- `yarn test-schema` will run the schema integration suite and the increment.
- `yarn test-schema-watch` will watch the first schema suite.
- `yarn test-schema-first` will run the first schema suite. you can pass jest arguments here
- `yarn test-schema-increment` will run the second schema suite
- `yarn test-build` will run the build integration suite
- `yarn test-build-watch` will watch the build integration suite
- `yarn test-update` will run `-u` for all schema and build integration suites.

# Changing test suite WordPress plugin versions in docker

1. Edit the versions as desired in `docker-compose.yml` in the `build.args` for `wordpress` service
2. Run `yarn docker-start -d` to detach, force re-build images and re-create containers, and ensure the plugins directory (volume) is renewed between builds
3. Run `yarn test-schema`. You should see a diff in the snapshots that demonstrates the change in schema with the changed plugin versions.
4. Run `yarn test-update` to update all test snapshots.
