import { slash } from "gatsby-core-utils";
import path from "path";
import { Tracer, initGlobalTracer } from "opentracing";

type ITracerProvider = {
  create(): Tracer;
  stop(): Promise<void>;
};

let tracerProvider: ITracerProvider | undefined;

/**
 * tracerFile should be a js file that exports two functions.
 *
 * `create` - Create and return an open-tracing compatible tracer. See
 * https://github.com/opentracing/opentracing-javascript/blob/master/src/tracer.ts
 *
 * `stop` - Run any tracer cleanup required before the node.js process
 * exits
 */
export async function initTracer(tracerFile: string): Promise<Tracer> {
  let tracer: Tracer;
  if (tracerFile) {
    process.env.GATSBY_OPEN_TRACING_CONFIG_FILE = tracerFile;
    const resolvedPath = slash(path.resolve(tracerFile));
    tracerProvider = require(resolvedPath);
    tracer = await tracerProvider!.create();
  } else {
    tracer = new Tracer(); // Noop
  }

  initGlobalTracer(tracer);

  return tracer;
}

export async function stopTracer(): Promise<void> {
  if (tracerProvider?.stop) {
    await tracerProvider.stop();
  }
}
