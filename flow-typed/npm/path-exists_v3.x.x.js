// flow-typed signature: 33a3a3bf2de571b296cf5905aea164bf
// flow-typed version: 94e9f7e0a4/path-exists_v3.x.x/flow_>=v0.28.x

declare module 'path-exists' {
  declare module.exports: {
    (filePath: string): Promise<boolean>,
    sync(filePath: string): boolean,
  };
}
