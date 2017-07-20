const Remark = require('remark');
const visit = require(`unist-util-visit`)

const plugin = require('../');

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
});

describe('gatsby-remark-responsive-iframe', () => {
  [
    'iframe',
    'object'
  ]
    .forEach(tag => {
      it(`transforms an ${tag}`, async () => {
        const markdownAST = remark.parse(`
<${tag} url="http://www.example.com/" width="600" height="400"></${tag}>
    `);

        const transformed = await plugin({ markdownAST });

        visit(transformed, 'unknown', node => {
          expect(node.data.hChildren.length).toBeGreaterThan(0);
          const [child] = node.data.hChildren;
          expect(child.value).toMatchSnapshot();
        });
      });
    });
});
