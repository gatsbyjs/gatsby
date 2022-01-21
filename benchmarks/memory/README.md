# Gatsby Memory Benchmark

The goal of this benchmark is to test Gatsby's memory usage and look for potential optimizations.

## The Docker Container

The docker container used in these tests sets up a Debian instance with node 14 installed (as well as npm/yarn/etc).
It has ports 9000 (for hosting gatsby) and 9229 (for debugging) exposed.

Within the container, two points to your local filesystem are mounted:

- /usr/src/gatsby : Your local gatsby repo
- /usr/src/site : The memory benchmark gatsby site

## Commands

### Docker

These commands are used for interfacing with docker and have built-in utilities for managing the docker container.

#### yarn docker:build

Builds the container used for testing.

#### yarn docker:start

Starts the container built by `yarn docker:build`.

#### yarn docker:connect

Connects to the container started by `yarn docker:start`.

#### yarn docker:start-and-connect

A shorthand for start + connect.

#### yarn docker:stop

Stop the container used for testing.

### Gatsby

These commands are used for interfacing with gatsby.

#### yarn gatsby:build

Simply an alias to `yarn gatsby build`.

#### yarn gatsby:serve

Starts `gatsby serve` on port 9000 and sets the host properly to work inside docker.

#### yarn gatsby:develop

Starts `gatsby develop` on port 9000 and sets the host properly to work inside docker.

#### yarn gatsby:build:debug

Runs `gatsby build` with `inspect-brk` set to start the [debugging process](https://www.gatsbyjs.com/docs/debugging-the-build-process/) on port 9229.

#### yarn gatsby:develop:debug

Runs `gatsby develop` with `inspect-brk` set to start the [debugging process](https://www.gatsbyjs.com/docs/debugging-the-build-process/) on port 9229.

## Testing

TODO

- How to configure memory limits
- Where to look
