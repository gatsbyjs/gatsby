export const script = {
  three: `three`,
  marked: `marked`,
  jQuery: `jQuery`,
  popper: `popper`,
}

export const scripts = {
  [script.three]: `http://localhost:8888/three.js`,
  [script.marked]: `http://localhost:8888/marked.js`,
  [script.jQuery]: `http://localhost:8888/j-query.js`,
  [script.popper]: `http://localhost:8888/popper.js`,
}

export const scriptStrategyIndex = {
  [script.three]: `post-hydrate`,
  [script.marked]: `idle`,
  [script.jQuery]: `post-hydrate`,
  [script.popper]: `idle`,
}

export const scriptSuccessIndex = {
  // @ts-ignore
  [script.three]: () => typeof THREE === `object`,
  // @ts-ignore
  [script.marked]: () => typeof marked === `object`,
  // @ts-ignore
  [script.jQuery]: () => typeof jQuery === `function`,
  // @ts-ignore
  [script.popper]: () => typeof Popper === `function`,
}

export const scriptUrlIndex = {
  [scripts.three]: script.three,
  [scripts.marked]: script.marked,
  [scripts.jQuery]: script.jQuery,
  [scripts.popper]: script.popper,
}

export const scriptUrls = new Set(Object.values(scripts))

export const inlineScript = {
  dangerouslySet: `dangerously-set`,
  templateLiteral: `template-literal`,
}

// Create an object literal instead of iterating so the contents are explicit
export const inlineScripts = {
  "dangerously-set": {
    "post-hydrate": constructInlineScript(`dangerously-set`, `post-hydrate`),
    idle: constructInlineScript(`dangerously-set`, `idle`),
  },
  "template-literal": {
    "post-hydrate": constructInlineScript(`template-literal`, `post-hydrate`),
    idle: constructInlineScript(`template-literal`, `idle`),
  },
}

function constructInlineScript(type, strategy) {
  return `
    performance.mark(\`inline-script\`, { detail: {
      strategy: \`${strategy}\`,
      type: \`${type}\`,
      executeStart: performance.now()
    }})
    window[\`${strategy}-${type}\`] = true;
  `
}
