---
title: Multi-core builds
---

Gatsby now performs the static HTML generation phase of the overall [Page HTML Generation](/docs/html-generation/) process using multi-core parallel pools of workers. This helps speed up builds by distributing build generation tasks across multiple cores on your machine.

By default Gatsby creates a pool of workers equal to the number of physical cores on your machine, see [build-html.js](/docs/html-generation/#build-htmljs)

In some scenarios it may be appropriate to tell Gatsby to use a different method to calculate the number of worker pools.

**For example**, if you are running a Cloud server (like AWS EC2) your DevOps engineers may want to control the number of worker pools to improve the efficiency of server resource usage.

### Warning

You could negatively impact performance if you use this variable incorrectly. The default Gatsby setting (no env variable or `physical_cores`) is the safest option.

### Setup

Set the `GATSBY_CPU_COUNT` environment variable whilst running the `gatsby build` command.

`GATSBY_CPU_COUNT=physical_cores` - (default) calculate the number worker pools based on the number of physical CPU cores on your machine.

`GATSBY_CPU_COUNT=logical_cores` - calculate the number worker pools based on the number of logical CPU cores on your machine.

`GATSBY_CPU_COUNT=2` - calculate the number worker pools based on a definite number.

### More information

Understanding how processors work is complex and out of scope for this documentation.

In summary, some processors use 'Simultaneous Multithreading (SMT)' (sometimes known as 'Hyper-Threading') which is the process of a CPU splitting each of its physical cores into virtual/logical cores.

This _can_ help some workloads to increase performance and allow each physical core to run two streams of work at once. However, sometimes latency can be increased as these logical cores share the same physical CPU core, more memory is required to assign to each worker in the pools and more time is needed spawn worker processes.
