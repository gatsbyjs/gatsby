// Script sources as convenient data structures to test with.
// Changing anything below may require a corresponding change in tests.

import { ScriptStrategy } from "gatsby-script"

export enum Script {
  dayjs = `dayjs`,
  three = `three`,
  marked = `marked`,
}

export const scripts: Record<Script, string> = {
  [Script.dayjs]: `https://cdn.jsdelivr.net/npm/dayjs@1.11.0/dayjs.min.js`,
  [Script.three]: `https://unpkg.com/three@0.139.1/build/three.js`,
  [Script.marked]: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`,
}

export const scriptIndex: Record<string, Script> = {
  [scripts.dayjs]: Script.dayjs,
  [scripts.three]: Script.three,
  [scripts.marked]: Script.marked,
}

export const scriptUrls = new Set(Object.values(scripts))

export const framework = `framework` // Framework bundle that includes react, react-dom, etc.

export enum InlineScript {
  dangerouslySet = `dangerously-set`,
  templateLiteral = `template-literal`,
}

// Create an object literal instead of iterating so the contents are explicit
export const inlineScripts = {
  [InlineScript.dangerouslySet]: {
    [ScriptStrategy.preHydrate]: constructInlineScript(
      InlineScript.dangerouslySet,
      ScriptStrategy.preHydrate
    ),
    [ScriptStrategy.postHydrate]: constructInlineScript(
      InlineScript.dangerouslySet,
      ScriptStrategy.postHydrate
    ),
    [ScriptStrategy.idle]: constructInlineScript(
      InlineScript.dangerouslySet,
      ScriptStrategy.idle
    ),
  },
  [InlineScript.templateLiteral]: {
    [ScriptStrategy.preHydrate]: constructInlineScript(
      InlineScript.templateLiteral,
      ScriptStrategy.preHydrate
    ),
    [ScriptStrategy.postHydrate]: constructInlineScript(
      InlineScript.templateLiteral,
      ScriptStrategy.postHydrate
    ),
    [ScriptStrategy.idle]: constructInlineScript(
      InlineScript.templateLiteral,
      ScriptStrategy.idle
    ),
  },
}

function constructInlineScript(type: string, strategy: ScriptStrategy): string {
  return `(function() {
    const inlineScript = document.createElement(\`div\`);
    inlineScript.dataset.strategy = \`${strategy}\`;
    inlineScript.dataset.type = \`${type}\`;
    const container = document.getElementById(\`elements-appended-by-inline-scripts\`);
    container.appendChild(inlineScript);
    performance.mark(\`inline-script\`, { detail: {
      strategy: \`${strategy}\`,
      type: \`${type}\`,
      executeEnd: performance.now()
    }})
  })();
  `
}
