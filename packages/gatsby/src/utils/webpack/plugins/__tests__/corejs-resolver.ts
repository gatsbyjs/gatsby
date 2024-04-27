import { slash } from "gatsby-core-utils";
import { CoreJSResolver } from "../corejs-resolver";
import { Resolver } from "webpack";

function executeResolve(
  resolver: CoreJSResolver,
  request: { request: string },
  doResolveMock: unknown,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const webpackResolver: Resolver = {
      // @ts-ignore Type 'unknown' is not assignable to type '(hook: AsyncSeriesBailHook<[ResolveRequest, ResolveContext], ResolveRequest | null, UnsetAdditionalOptions>, request: ResolveRequest, message: string | null, resolveContext: ResolveContext, callback: (err?: Error | ... 1 more ... | undefined, result?: ResolveRequest | undefined) => void) => void'.ts(2322)
      doResolve: doResolveMock,
      // @ts-ignore Type 'string | AsyncSeriesBailHook<[ResolveRequest, ResolveContext], ResolveRequest | null, UnsetAdditionalOptions>' is not assignable to type 'AsyncSeriesBailHook<[ResolveRequest, ResolveContext], ResolveRequest | null, UnsetAdditionalOptions>'.
      // Type 'string' is not assignable to type 'AsyncSeriesBailHook<[ResolveRequest, ResolveContext], ResolveRequest | null, UnsetAdditionalOptions>'.ts(2322)

      ensureHook: (hook) => hook,
      // @ts-ignore Type '() => { tapAsync: (_name: string, fn: (...args: Array<unknown>) => void) => void; }' is not assignable to type '(name: string | AsyncSeriesBailHook<[ResolveRequest, ResolveContext], ResolveRequest | null, UnsetAdditionalOptions>) => AsyncSeriesBailHook<...>'.
      // Type '{ tapAsync: (_name: string, fn: (...args: unknown[]) => void) => void; }' is missing the following properties from type 'AsyncSeriesBailHook<[ResolveRequest, ResolveContext], ResolveRequest | null, UnsetAdditionalOptions>': tapPromise, name, taps, intercept, and 5 more.ts(2322)
      getHook: () => {
        return {
          tapAsync: (
            _name: string,
            fn: (...args: Array<unknown>) => void,
          ): void => {
            fn(request, null, (err, result) =>
              err ? reject(err) : resolve(result),
            );
          },
        };
      },
    };

    resolver.apply(webpackResolver);
  });
}

describe("CoreJSResolver", () => {
  it("should convert core-js@2 file to core-js@3", async () => {
    const resolver = new CoreJSResolver();

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const doResolve = jest.fn((_, request, __, ___, callback) =>
      callback(null, slash(request.request)),
    );

    expect(
      await executeResolve(
        resolver,
        { request: "core-js/modules/es6.array.split.js" },
        doResolve,
      ),
    ).toEqual(expect.stringContaining("core-js/modules/es.array.split.js"));
  });

  it("should convert es6.regexp.replace to it's corejs@3 equivalent", async () => {
    const resolver = new CoreJSResolver();

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const doResolve = jest.fn((_, request, __, ___, callback) =>
      callback(null, slash(request.request)),
    );

    expect(
      await executeResolve(
        resolver,
        { request: "core-js/modules/es6.regexp.replace.js" },
        doResolve,
      ),
    ).toEqual(expect.stringContaining("core-js/modules/es.string.replace.js"));
  });

  it("should ignore non corejs requests", async () => {
    const resolver = new CoreJSResolver();

    const doResolve = jest.fn();

    expect(
      await executeResolve(
        resolver,
        { request: "gatsby/not/core-js.js" },
        doResolve,
      ),
    ).toBeUndefined();
    expect(doResolve).not.toHaveBeenCalled();
  });
});
