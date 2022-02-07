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

#### yarn docker:stats

Show a polling display of the container's docker stats.

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

## Setup

Currently we can reproduce builds crashing with out default settings

- Docker container running with 2GB limit
- 300 nodes x ~2MB each = ~600MB of "just" nodes data in each process (number of nodes can be controlled with NUM_NODES env var)
- 3 workers + main process (`GATSBY_CPU_COUNT` set to 4 in docker image, but you can specify different value with env var - for example `GATSBY_CPU_COUNT=6 yarn gatsby:build`)
- `eq_field` template using fast filters (single `eq` specifically)

Goal is to make `eq_field` template to not cause crashes, then add next template (different operator) that cause crashes and repeat until all queries can be handled with set memory limits.

### Workflow

While `gatsby-dev` command is available inside docker, from my testing it seems like it doesn't pick up file changes when run there. Workflow that seems to work reliably:

When starting working with this benchmark:

- start `yarn watch` (possibly with `--scope`) in monorepo
- start `gatsby-dev` outside of docker in benchmark directory (just like with regular site)
- `yarn docker:connect` to get inside docker
- `npm rebuild` to rebuild binaries inside docker

And repeat as many times as you want:

- make changes to `gatsby` source code as you normally would
- run `yarn gatsby:build` inside docker

## Testing

TODO

- How to configure memory limits
- Where to look
