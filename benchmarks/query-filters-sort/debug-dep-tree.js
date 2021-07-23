// just for debugging dep tree
const fs = require(`fs-extra`);
const v8 = require(`v8`);

async function run() {
  const stuff = v8.deserialize(await fs.readFile(`dep-tree.json`));

  function findCode(code) {
    // stuff.modules.filter(m => m && m.code && m.code.includes(code)).map

    return Object.fromEntries(
      Object.entries(stuff.modules)
        .filter(
          (tupple) =>
            tupple &&
            tupple[1] &&
            tupple[1].code &&
            tupple[1].code.includes(code)
        )
        .map((tupple) => {
          let toMerge = stuff.modulesMap[tupple[0]] || {};
          if (toMerge.code) {
            toMerge.codeSource = toMerge.code;
          }

          return [tupple[0], { ...toMerge, ...tupple[1] }];
        })
    );
  }

  function findModule(mod) {
    // stuff.modules.filter(m => m && m.code && m.code.includes(code)).map

    return Object.fromEntries(
      Object.entries(stuff.modulesMap).filter(
        (tupple) => tupple && tupple[0] && tupple[0].includes(mod)
      )
    );
  }

  // just so it's "used" and debugger has access to it
  const _ = findCode.bind(this);
  const _2 = findModule.bind(this);

  debugger;
}

run();
