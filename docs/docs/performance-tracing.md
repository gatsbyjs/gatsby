---
title: "Performance tracing"
---

Gatsby allows a build to be traced, enabling you to find which plugins or parts of the build are taking the longest. The trace information can be viewed in any [open tracing](http://opentracing.io/) compatible tool such as [https://www.jaegertracing.io/](https://www.jaegertracing.io/). You can also use Zipkin compatible tools such as [Zipkin](https://zipkin.io/) or [Honeycomb](https://www.honeycomb.io/).

![Example Zipkin Trace](./images/zipkin-trace.png)

## Running Gatsby with tracing turned on

Gatsby code is instrumented with Open Tracing, which is a general tracing API that is implementation agnostic. Therefore, you'll need to include and configure an open tracing compatible library in your application, as well as a backend to collect the trace data.

The steps required to add tracing are below. Including an [example](/docs/performance-tracing/#local-zipkin-with-docker) of how to get tracing working with zipkin locally using docker

### 1. Library dependency

Add an [open-tracing compatible library](https://github.com/opentracing) to your site's `package.json` dependencies.

### 2. Library configuration file

Each open tracing library must be configured. For example, what is the URL of the tracing backend? How often should spans be sent to the backend? What service name should the trace be recorded under? Etc.

The configuration file is a javascript file that exports two functions. `create` and `stop`

- **create**: Create and return an [open tracing compatible Tracer](https://github.com/opentracing/opentracing-javascript/blob/master/src/tracer.ts). It is called at the start of the build
- **stop**: Called at the end of the build. Any cleanup required by the tracer should be performed here. Such as clearing out any span queues and sending them to the tracing backend.

### 3. Start Gatsby with tracing turned on

The above configuration file can be passed to Gatsby with the `--open-tracing-config-file` command-line option. When Gatsby is started with this option, it will load the supplied tracing configuration file, and call its `create` function. The returned Tracer will be used for tracing the build. Once the build has stopped, the configuration file's `stop` method will be called, allowing the tracing implementation to perform any cleanup.

## Tracing backend examples

There are many open tracing compatible backends available. Below is an example of how to hook zipkin into Gatsby

### local Zipkin with Docker

[Zipkin](https://zipkin.io/) is an open source Tracing system that can be run locally using docker.

1.  Add following dependencies to your site's `package.json`

    - [zipkin](https://www.npmjs.com/package/zipkin)
    - [zipkin-javascript-opentracing](https://www.npmjs.com/package/zipkin-javascript-opentracing)
    - [zipkin-transport-http](https://www.npmjs.com/package/zipkin-transport-http)

2.  Run Zipkin all-in-one docker instance with `docker run -d -p 9411:9411 openzipkin/zipkin`. See [Zipkin Getting Started](https://zipkin.io/pages/quickstart.html) for more information.

3.  Start Gatsby `build` or `develop` with `--open-tracing-config-file` pointing at the Zipkin configuration file. An example file is provided in the gatsby project under `node_modules/gatsby/dist/utils/tracer/zipkin-local.js` that will send tracing spans to your local docker instance. E.g

    ```
    gatsby build --open-tracing-config-file node_modules/gatsby/dist/utils/tracer/zipkin-local.js
    ```

4.  Once the build is complete, view your tracing information at [http://localhost:9411](http://localhost:9411)
