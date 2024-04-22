const usedReference = 'used reference';

module.exports = function () {
  const x = new Response({})

  return usedReference
}

exports.getServerData = async function getServerData() {
  const data = await globalThis.fetch('https://example.com');
  const file = fs.readFileSync('./unknown.tmp.json', 'utf8')

  return {
    props: {
      file,
    }
  }
}

exports.config = function config() {
  return {
    pageContext: {
      env: 'test',
      unusedReference,
    },
  }
}

exports.anotherFunction = function anotherFunction() {
  return "test"
}
