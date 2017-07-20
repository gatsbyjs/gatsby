const Remark = require('remark');
const visit = require(`unist-util-visit`)

const plugin = require('../');

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
});

describe('gatsby-remark-smartypants', () => {
  it('applies smartypants to text nodes', () => {
    const sentence = `He said, "A \'simple\' english sentence. . .`;

    const markdownAST = remark.parse(`
${sentence}
    `);

    const transformed = plugin({ markdownAST });

    visit(transformed, 'text', node => {
      expect(node.value).not.toBe(sentence);
      expect(node.value).toMatchSnapshot();
    });
  });

  it('leaves other nodes alone', () => {
    const markdownAST = remark.parse(`
# Hello World

a regular sentence

- list item
- other list item

1. numbered
1. other numbered
    `);

    const transformed = plugin({ markdownAST });

    expect(transformed).toEqual(markdownAST);
  });
});
