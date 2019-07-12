"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const Remark = require(`remark`);

const toHAST = require(`mdast-util-to-hast`);

const hastToHTML = require(`hast-util-to-html`);

const cheerio = require(`cheerio`);

const plugin = require(`../`);

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

const run =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(function* (content) {
    const markdownAST = remark.parse(content);
    yield plugin({
      markdownAST
    });
    const htmlAst = toHAST(markdownAST, {
      allowDangerousHTML: true
    });
    const html = hastToHTML(htmlAst, {
      allowDangerousHTML: true
    });
    return html;
  });

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();

describe(`handles valid graph languages`, () => {
  it(`dot`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    const test = yield run(`
\`\`\`dot
  digraph graphname {
    a -> b;
    b -> c;
    a -> c;
  }
\`\`\``);
    const $ = cheerio.load(test);
    expect($(`svg`).length).toBe(1);
    expect($(`pre`).length).toBe(0);
    expect($(`code`).length).toBe(0);
  }));
  it(`circo`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    const test = yield run(`
\`\`\`circo
  digraph graphname {
    a -> b;
    b -> c;
    a -> c;
  }
\`\`\``);
    const $ = cheerio.load(test);
    expect($(`svg`).length).toBe(1);
    expect($(`pre`).length).toBe(0);
    expect($(`code`).length).toBe(0);
  }));
  it(`unknown graph lang`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    const test = yield run(`
\`\`\`pieh-format
  digraph graphname {
    a :heart: b;
  }
\`\`\``);
    const $ = cheerio.load(test);
    expect($(`svg`).length).toBe(0);
    expect($(`pre`).length).toBe(1);
    expect($(`code`).length).toBe(1);
  }));
});