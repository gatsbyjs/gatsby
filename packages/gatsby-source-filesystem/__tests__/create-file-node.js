var path = require(`path`);

var _require = require(`../create-file-node`),
    createFileNode = _require.createFileNode; // FIXME: This test needs to not use snapshots because of file differences
// and locations across users and CI systems


describe(`create-file-node`, function () {
  it(`creates a file node`, function () {
    return createFileNode(path.resolve(`${__dirname}/fixtures/file.json`), {});
  });
});