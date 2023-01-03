const {
  Response
} = require('node-fetch');
const usedReference = 'used reference';
module.exports = function () {
  const x = new Response({});
  return usedReference;
};
exports.anotherFunction = function anotherFunction() {
  return "test";
};
