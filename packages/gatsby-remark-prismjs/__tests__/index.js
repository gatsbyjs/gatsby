var remark = require(`remark`);

var plugin = require(`../index`);

describe(`remark prism plugin`, function () {
  it(`generates a <pre> tag with class="language-*" prefix by default`, function () {
    var code = `\`\`\`js\n// Fake\n\`\`\``;
    var markdownAST = remark.parse(code);
    plugin({
      markdownAST
    });
    expect(markdownAST).toMatchSnapshot();
  });
  it(`generates a <pre> tag with a custom class prefix if configured`, function () {
    var code = `\`\`\`js\n// Fake\n\`\`\``;
    var markdownAST = remark.parse(code);
    plugin({
      markdownAST
    }, {
      classPrefix: `custom-`
    });
    expect(markdownAST).toMatchSnapshot();
  });
});