# Structured Logging

Tests to ensure a couple of functionalities from our structured logging, including (local) plugins.

- Verifies IPC, logs, panic, status
- Verifies plugin errors with an errorMap
- Verifies plugin options. The tests will verify local plugin options schema validation by dropping file markers into the build folder with a flag that flips if the `pluginOptionsSchema` export is invoked.

## Problems

- Concurrent tests will need to generate a unique build folder name
