---
title: Multi-core Builds
---

Gatsby now performs the static HTML generation phase of the overall [Page HTML Generation](/docs/html-generation/) process using multi-core parallel pools of workers. This helps speed up builds by distributing build generation tasks across multiple cores on your machine.

By default, Gatsby creates a pool of workers equal to the number of physical cores on your machine. See [build-html.js](/docs/html-generation/#build-htmljs).

In some scenarios, it may be appropriate to tell Gatsby to use a different method to calculate the number of worker pools.

**For example**, if you are running a Cloud server (like AWS EC2), your DevOps engineers may want to control the number of worker pools to improve the efficiency of server resource usage.

## Warning

You could negatively impact performance if you use this variable incorrectly. The default Gatsby setting (no env variable or `physical_cores`) is the safest option.

## Setup

Set the `GATSBY_CPU_COUNT` environment variable whilst running the `gatsby build` command.

`GATSBY_CPU_COUNT=physical_cores` - (default) calculate the number of worker pools based on the number of physical CPU cores on your machine.

`GATSBY_CPU_COUNT=logical_cores` - calculate the number worker of pools based on the number of logical CPU cores on your machine.

`GATSBY_CPU_COUNT=2` - calculate the number worker pools based on a definite number.

## More information

Understanding how processors work is complex and out of scope for this documentation.

In brief, some processors use _Simultaneous Multithreading (SMT)_, sometimes known as _Hyper-Threading_, which is the process of a CPU splitting each of its physical cores into virtual/logical cores.

SMT _can_ help to increase performance of some workloads by allowing each physical core to run two streams of work at once.

However, sometimes latency can be increased. As logical cores share the same physical CPU core, sometimes more memory is required for each worker in the pool and more time is needed to spawn worker processes.
