// Script sources as convenient data structures to test with.
// Changing anything below may require a corresponding change in tests.

import { ScriptStrategy } from "gatsby-script"

export enum Script {
  three = `three`,
  marked = `marked`,
  jQuery = `jQuery`,
  popper = `popper`,
}

export const scripts: Record<Script, string> = {
  [Script.three]: `https://unpkg.com/three@0.139.1/build/three.js`,
  [Script.marked]: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`,
  [Script.jQuery]: `https://code.jquery.com/jquery-3.4.1.min.js`,
  [Script.popper]: `https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js`,
}

export const scriptStrategyIndex: Record<Script, ScriptStrategy> = {
  [Script.three]: ScriptStrategy.postHydrate,
  [Script.marked]: ScriptStrategy.idle,
  [Script.jQuery]: ScriptStrategy.postHydrate,
  [Script.popper]: ScriptStrategy.idle,
}

export const scriptSuccessIndex: Record<Script, () => boolean> = {
  // @ts-ignore
  [Script.three]: () => typeof THREE === `object`,
  // @ts-ignore
  [Script.marked]: () => typeof marked === `object`,

  // @ts-ignore
  [Script.jQuery]: () => typeof jQuery === `function`,
  // @ts-ignore
  [Script.popper]: () => typeof Popper === `function`,
}

export const scriptUrlIndex: Record<string, Script> = {
  [scripts.three]: Script.three,
  [scripts.marked]: Script.marked,
  [scripts.jQuery]: Script.jQuery,
  [scripts.popper]: Script.popper,
}

export const scriptUrls = new Set(Object.values(scripts))

export enum InlineScript {
  dangerouslySet = `dangerously-set`,
  templateLiteral = `template-literal`,
}

// Create an object literal instead of iterating so the contents are explicit
export const inlineScripts = {
  [InlineScript.dangerouslySet]: {
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
  return `
    performance.mark(\`inline-script\`, { detail: {
      strategy: \`${strategy}\`,
      type: \`${type}\`,
      executeStart: performance.now()
    }})
    window[\`${strategy}-${type}\`] = true;
  `
}
