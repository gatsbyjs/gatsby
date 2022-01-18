
export default function () {
  return "test"
}

function getServerData() {
  return {
    props: {}

  }
}


async function pageConfig() {
  return {
    pageContext: {
      env: 'test'
    },
  }
}

function anotherFunction() {
  return "test"
}

export {
  getServerData,
  pageConfig as config,
  anotherFunction
}
