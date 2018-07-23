const fs = require("fs");
const path = require("path");
const os = require("os");
const mkdirp = require("mkdirp");
const transform = require("babel-core").transform;

exports.createComponent = (name, code) => {
  const filedir = path.resolve(os.tmpdir(), "gatsby-plugin-mdx-live", "pages");
  mkdirp.sync(filedir);
  const filepath = path.resolve(filedir, `${name}.js`);
  const es5 = transform(code, {
    presets: ["@babel/preset-env", require.resolve("@babel/preset-react")]
  }).code;
  console.log(es5);
  fs.writeFileSync(filepath, es5);
  console.log("filepath", filepath);
  return filepath;
};
