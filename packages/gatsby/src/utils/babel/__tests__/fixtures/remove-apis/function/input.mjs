
export default function () {
  return "test"
}

export function getServerData() {
  return {
    props: {}

  }
}

export async function config() {
  return {
    pageContext: {
      env: 'test'
    },
  }
}

export function anotherFunction() {
  return "test"
}
