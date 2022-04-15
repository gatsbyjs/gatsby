// Script sources as convenient data structures to test with.
// Changing anything below may require a corresponding change in tests.

export enum Script {
  dayjs = `dayjs`,
  three = `three`,
  marked = `marked`,
}

export const scripts: Record<Script, string> = {
  [Script.dayjs]: "https://cdn.jsdelivr.net/npm/dayjs@1.11.0/dayjs.min.js",
  [Script.three]: "https://unpkg.com/three@0.139.1/build/three.js",
  [Script.marked]: "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
}

export const scriptIndex: Record<string, Script> = {
  [scripts.dayjs]: Script.dayjs,
  [scripts.three]: Script.three,
  [scripts.marked]: Script.marked,
}

export const scriptUrls = new Set(Object.values(scripts))

export const framework = `framework` // Framework bundle that includes react, react-dom, etc.
